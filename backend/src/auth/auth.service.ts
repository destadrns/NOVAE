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
   * Verify an incoming Supabase JWT access token
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
        this.logger.debug(`Supabase cloud verify failed, checking JWT secret: ${(err as Error).message}`);
      }
    }

    // 2. Verify JWT signature locally using JWT secret
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as Record<string, any>;
      const userId = decoded.sub || decoded.id;
      const email = decoded.email || '';

      if (!userId || !email) {
        throw new UnauthorizedException('Invalid token payload: missing sub or email');
      }

      return {
        id: userId,
        email,
        user_metadata: decoded.user_metadata || {
          full_name: decoded.name || decoded.full_name,
          avatar_url: decoded.avatar_url,
        },
      };
    } catch (jwtErr) {
      // 3. Check for decoded mock development payload if token is encoded
      try {
        const decodedWithoutVerify = jwt.decode(token) as Record<string, any>;
        if (
          process.env.NODE_ENV !== 'production' &&
          decodedWithoutVerify &&
          (decodedWithoutVerify.sub || decodedWithoutVerify.id) &&
          decodedWithoutVerify.email
        ) {
          return {
            id: decodedWithoutVerify.sub || decodedWithoutVerify.id,
            email: decodedWithoutVerify.email,
            user_metadata: decodedWithoutVerify.user_metadata || {
              full_name: decodedWithoutVerify.name || decodedWithoutVerify.full_name,
            },
          };
        }
      } catch {
        // ignore
      }

      throw new UnauthorizedException(`Invalid or expired authentication token: ${(jwtErr as Error).message}`);
    }
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
}
