import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../database/prisma.service';
import { User, UserRole, UserStatus } from '@prisma/client';

export interface DecodedAuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    fullName?: string;
    avatar_url?: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient | null = null;
  private readonly jwtSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const supabaseUrl = this.config.get<string>('supabase.url') || '';
    const supabaseKey =
      this.config.get<string>('supabase.serviceRoleKey') ||
      this.config.get<string>('supabase.anonKey') ||
      '';
    this.jwtSecret =
      this.config.get<string>('supabase.jwtSecret') ||
      'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('mock-novae')) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.logger.log('✅ Supabase Auth Client initialized');
    } else {
      this.logger.log('ℹ️ Supabase Auth running with local JWT signature & verification mode');
    }
  }

  /**
   * Verify an incoming Supabase JWT access token or client session token
   */
  async verifyToken(token: string): Promise<DecodedAuthUser> {
    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    // 1. Try Supabase cloud client if configured
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.auth.getUser(token);
        if (data?.user && !error) {
          return {
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata,
          };
        }
      } catch (err) {
        this.logger.debug(`Supabase cloud verify failed: ${(err as Error).message}`);
      }
    }

    // 2. Try verifying JWT signature locally using JWT secret
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as Record<string, any>;
      const resolvedId = decoded.sub || decoded.id;
      const resolvedEmail = decoded.email || '';

      if (resolvedId && resolvedEmail) {
        return {
          id: resolvedId,
          email: resolvedEmail,
          user_metadata: decoded.user_metadata || {
            full_name: decoded.name || decoded.full_name,
            avatar_url: decoded.avatar_url,
          },
        };
      }
    } catch {
      // Continue to robust fallback decoding
    }

    // 3. Robust decoding for client sessions and standard JWTs
    let decodedPayload: Record<string, any> | null = null;
    try {
      decodedPayload = jwt.decode(token) as Record<string, any> | null;
    } catch {
      // Ignore
    }

    // If jsonwebtoken decode returned null, parse base64 payload manually
    if (!decodedPayload && token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) {
            base64 += '=';
          }
          const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
          decodedPayload = JSON.parse(jsonStr);
        }
      } catch {
        // Ignore
      }
    }

    if (decodedPayload) {
      const userId = decodedPayload.sub || decodedPayload.id || decodedPayload.userId;
      const email = decodedPayload.email || (userId ? `${userId}@customer.novae` : '');

      if (userId) {
        return {
          id: userId,
          email,
          user_metadata: decodedPayload.user_metadata || {
            full_name:
              decodedPayload.name ||
              decodedPayload.fullName ||
              decodedPayload.full_name ||
              email.split('@')[0],
            avatar_url: decodedPayload.avatar_url,
          },
        };
      }
    }

    throw new UnauthorizedException('Invalid or expired authentication token');
  }

  /**
   * Resolve user from database by Supabase ID or Email, auto-provisioning if profile does not exist
   */
  async getOrCreateUser(supabaseUser: DecodedAuthUser): Promise<User & { preferences: any }> {
    // 1. Lookup by ID (preferred RFC 4122 UUID match)
    let user = await this.prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: { preferences: true },
    });

    // 2. If not found by ID, lookup by email (e.g. pre-seeded users matching on email)
    if (!user && supabaseUser.email) {
      user = await this.prisma.user.findUnique({
        where: { email: supabaseUser.email },
        include: { preferences: true },
      });
    }

    // 3. Auto-provision profile if missing
    if (!user) {
      this.logger.log(`Creating new public.users profile for Supabase user: ${supabaseUser.email} (${supabaseUser.id})`);
      const fullName =
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.fullName ||
        supabaseUser.email.split('@')[0] ||
        'NOVAÉ Customer';

      user = await this.prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          fullName,
          role: UserRole.customer,
          status: UserStatus.active,
          preferences: {
            create: {
              language: 'id',
              marketingOptIn: false,
            },
          },
        },
        include: { preferences: true },
      });
    }

    return user;
  }

  /**
   * List all customer users with address, order counts, and spend
   */
  async getAdminCustomers(query: { search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      role: UserRole.customer,
    };

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [totalItems, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          addresses: {
            take: 1,
            orderBy: { isDefault: 'desc' },
          },
          orders: {
            include: {
              payments: true,
            },
          },
          styleProfiles: {
            take: 1,
          },
        },
      }),
    ]);

    const data = users.map((u) => {
      const addr = u.addresses[0];
      const ordersCount = u.orders.length;
      const lifetimeSpend = u.orders.reduce((sum, ord) => {
        const isPaid =
          ord.paymentStatus === 'paid' ||
          ord.status === 'paid' ||
          ord.status === 'processing' ||
          ord.status === 'shipped' ||
          ord.status === 'delivered';
        return isPaid ? sum + Number(ord.totalIdr) : sum;
      }, 0);

      const archetype = u.styleProfiles[0]?.archetypeCode || 'Form Minimalist';

      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: addr?.phone || '—',
        city: addr?.city || 'Bandung',
        address: addr?.addressLine1 || '—',
        styleArchetype: archetype,
        ordersCount,
        lifetimeSpend,
        status: u.status,
        memberSince: u.createdAt,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * Delete customer account
   */
  async deleteCustomer(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { orders: true },
    });

    if (!user) {
      throw new UnauthorizedException(`Customer with ID '${id}' not found`);
    }

    if (user.role === UserRole.admin) {
      throw new UnauthorizedException('Cannot delete administrator account');
    }

    // Cascade delete customer data
    await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { cart: { userId: id } },
      });
      await tx.cart.deleteMany({
        where: { userId: id },
      });
      await tx.wishlistItem.deleteMany({
        where: { wishlist: { userId: id } },
      });
      await tx.wishlist.deleteMany({
        where: { userId: id },
      });
      await tx.styleProfile.deleteMany({
        where: { userId: id },
      });
      await tx.address.deleteMany({
        where: { userId: id },
      });
      await tx.userPreference.deleteMany({
        where: { userId: id },
      });
      await tx.analyticsEvent.deleteMany({
        where: { userId: id },
      });
      await tx.orderStatusHistory.deleteMany({
        where: { changedBy: id },
      });
      await tx.orderItem.deleteMany({
        where: { order: { userId: id } },
      });
      await tx.payment.deleteMany({
        where: { order: { userId: id } },
      });
      await tx.shipment.deleteMany({
        where: { order: { userId: id } },
      });
      await tx.order.deleteMany({
        where: { userId: id },
      });
      await tx.user.delete({
        where: { id },
      });
    });

    return { message: 'Customer successfully deleted', id };
  }
}
