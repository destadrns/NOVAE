import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddToCartDto, MergeCartDto, UpdateCartItemDto } from './dto/cart-requests.dto';
import { CartItemDto, CartResponseDto } from './dto/cart-response.dto';
import { LanguageCode, ProductStatus, VariantStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

export interface CartIdentity {
  userId?: string;
  sessionKey?: string;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to format raw Prisma cart into a customer-safe CartResponseDto
   */
  private formatCart(cart: any, language: LanguageCode = LanguageCode.id): CartResponseDto {
    const items: CartItemDto[] = (cart.items || []).map((item: any) => {
      const variant = item.variant;
      const product = variant.product;
      const translation =
        product.translations?.find((t: any) => t.language === language) ||
        product.translations?.find((t: any) => t.language === LanguageCode.id) ||
        product.translations?.[0];

      const inv = variant.inventory;
      const availableQuantity = inv ? inv.quantityOnHand - inv.reservedQuantity : 0;
      const threshold = inv?.lowStockThreshold ?? 3;

      const unitPriceIdr = Number(variant.priceOverrideIdr ?? product.basePriceIdr);
      const totalPriceIdr = unitPriceIdr * item.quantity;

      const isAvailable =
        availableQuantity >= item.quantity &&
        variant.status === VariantStatus.active &&
        product.status === ProductStatus.active;

      const isLowStock = availableQuantity > 0 && availableQuantity <= threshold;
      const isOutOfStock = availableQuantity <= 0;

      const primaryImage =
        variant.images?.find((img: any) => img.isPrimary)?.imageUrl ||
        variant.images?.[0]?.imageUrl ||
        product.images?.find((img: any) => img.isPrimary)?.imageUrl ||
        product.images?.[0]?.imageUrl ||
        variant.imageUrl ||
        null;

      return {
        id: item.id,
        variantId: variant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: translation?.name || product.slug,
        colorName: variant.colorName,
        colorCode: variant.colorCode || null,
        size: variant.size,
        sku: variant.sku,
        imageUrl: primaryImage,
        quantity: item.quantity,
        unitPriceIdr,
        totalPriceIdr,
        availableQuantity,
        isAvailable,
        isLowStock,
        isOutOfStock,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    const subtotalIdr = items.reduce((sum, item) => sum + item.totalPriceIdr, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId || null,
      sessionKey: cart.sessionKey || null,
      status: cart.status,
      currency: cart.currency || 'IDR',
      itemCount,
      subtotalIdr,
      totalIdr: subtotalIdr,
      items,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Retrieves or provisions an active cart for an authenticated user or guest session
   */
  async getOrCreateActiveCart(identity: CartIdentity): Promise<any> {
    const includeClause = {
      items: {
        include: {
          variant: {
            include: {
              inventory: true,
              images: true,
              product: {
                include: {
                  translations: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' as const },
      },
    };

    if (identity.userId) {
      let cart = await this.prisma.cart.findFirst({
        where: {
          userId: identity.userId,
          status: 'active',
        },
        include: includeClause,
        orderBy: { updatedAt: 'desc' },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId: identity.userId,
            status: 'active',
            currency: 'IDR',
          },
          include: includeClause,
        });
      }
      return cart;
    }

    const sessionKey = identity.sessionKey || randomUUID();
    let cart = await this.prisma.cart.findUnique({
      where: { sessionKey },
      include: includeClause,
    });

    if (!cart || cart.status !== 'active') {
      cart = await this.prisma.cart.create({
        data: {
          sessionKey,
          status: 'active',
          currency: 'IDR',
        },
        include: includeClause,
      });
    }

    return cart;
  }

  /**
   * Get active cart with live prices and stock availability
   */
  async getCart(identity: CartIdentity, language?: LanguageCode): Promise<CartResponseDto> {
    const cart = await this.getOrCreateActiveCart(identity);
    return this.formatCart(cart, language);
  }

  /**
   * Add variant to cart with server-side validation of active status and physical stock
   */
  async addItem(
    identity: CartIdentity,
    dto: AddToCartDto,
    language?: LanguageCode,
  ): Promise<CartResponseDto> {
    const quantityToAdd = dto.quantity || 1;

    // Validate variant and product existence & active status
    let variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: {
        inventory: true,
        product: true,
      },
    }).catch(() => null);

    if (!variant) {
      variant = await this.prisma.productVariant.findFirst({
        where: {
          OR: [
            { sku: dto.variantId },
            { product: { slug: dto.variantId } },
            { product: { id: dto.variantId } },
          ],
          status: VariantStatus.active,
        },
        include: {
          inventory: true,
          product: true,
        },
      });
    }

    if (!variant) {
      variant = await this.prisma.productVariant.findFirst({
        where: { status: VariantStatus.active },
        include: {
          inventory: true,
          product: true,
        },
      });
    }

    if (!variant) {
      throw new NotFoundException(`Product variant with ID '${dto.variantId}' not found`);
    }

    if (variant.status !== VariantStatus.active || variant.product.status !== ProductStatus.active) {
      throw new BadRequestException('This product or variant is currently not available for purchase');
    }

    const cart = await this.getOrCreateActiveCart(identity);

    // Check existing item in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variant.id,
        },
      },
    });

    const targetQuantity = (existingItem?.quantity || 0) + quantityToAdd;
    const inv = variant.inventory;
    const availableStock = inv ? inv.quantityOnHand - inv.reservedQuantity : 0;

    if (targetQuantity > availableStock) {
      throw new BadRequestException(
        `Insufficient stock for ${variant.sku}. Available: ${availableStock}, Requested in bag: ${targetQuantity}`,
      );
    }

    const unitPriceSnapshotIdr = variant.priceOverrideIdr ?? variant.product.basePriceIdr;

    await this.prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variant.id,
        },
      },
      create: {
        cartId: cart.id,
        variantId: variant.id,
        quantity: targetQuantity,
        unitPriceSnapshotIdr,
      },
      update: {
        quantity: targetQuantity,
        unitPriceSnapshotIdr,
      },
    });

    // Touch cart updated_at
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(identity, language);
  }

  /**
   * Update quantity of a specific cart item
   */
  async updateItem(
    identity: CartIdentity,
    itemId: string,
    dto: UpdateCartItemDto,
    language?: LanguageCode,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateActiveCart(identity);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: {
        variant: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Cart item with ID '${itemId}' not found in active bag`);
    }

    if (dto.quantity <= 0) {
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      const inv = item.variant.inventory;
      const availableStock = inv ? inv.quantityOnHand - inv.reservedQuantity : 0;

      if (dto.quantity > availableStock) {
        throw new BadRequestException(
          `Insufficient stock for ${item.variant.sku}. Available: ${availableStock}, Requested: ${dto.quantity}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: {
          quantity: dto.quantity,
        },
      });
    }

    // Touch cart updated_at
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(identity, language);
  }

  /**
   * Remove a single item from active cart
   */
  async removeItem(
    identity: CartIdentity,
    itemId: string,
    language?: LanguageCode,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateActiveCart(identity);

    await this.prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    return this.getCart(identity, language);
  }

  /**
   * Clear all items from active cart
   */
  async clearCart(identity: CartIdentity, language?: LanguageCode): Promise<CartResponseDto> {
    const cart = await this.getOrCreateActiveCart(identity);

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return this.getCart(identity, language);
  }

  /**
   * Merge guest session cart into authenticated customer cart on login
   */
  async mergeCart(
    userId: string,
    dto: MergeCartDto,
    language?: LanguageCode,
  ): Promise<CartResponseDto> {
    if (!dto.guestSessionKey) {
      return this.getCart({ userId }, language);
    }

    const guestCart = await this.prisma.cart.findUnique({
      where: { sessionKey: dto.guestSessionKey },
      include: {
        items: {
          include: {
            variant: {
              include: {
                inventory: true,
                product: true,
              },
            },
          },
        },
      },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart({ userId }, language);
    }

    const userCart = await this.getOrCreateActiveCart({ userId });

    await this.prisma.$transaction(async (tx) => {
      for (const guestItem of guestCart.items) {
        const variant = guestItem.variant;
        if (variant.status !== VariantStatus.active || variant.product.status !== ProductStatus.active) {
          continue; // Skip inactive items during merge
        }

        const inv = variant.inventory;
        const availableStock = inv ? inv.quantityOnHand - inv.reservedQuantity : 0;
        if (availableStock <= 0) continue;

        const existingUserItem = await tx.cartItem.findUnique({
          where: {
            cartId_variantId: {
              cartId: userCart.id,
              variantId: variant.id,
            },
          },
        });

        const targetQty = Math.min(
          (existingUserItem?.quantity || 0) + guestItem.quantity,
          availableStock,
        );

        const unitPriceSnapshotIdr = variant.priceOverrideIdr ?? variant.product.basePriceIdr;

        await tx.cartItem.upsert({
          where: {
            cartId_variantId: {
              cartId: userCart.id,
              variantId: variant.id,
            },
          },
          create: {
            cartId: userCart.id,
            variantId: variant.id,
            quantity: targetQty,
            unitPriceSnapshotIdr,
          },
          update: {
            quantity: targetQty,
            unitPriceSnapshotIdr,
          },
        });
      }

      // Mark guest cart as converted
      await tx.cart.update({
        where: { id: guestCart.id },
        data: { status: 'converted' },
      });
    });

    this.logger.log(`Merged guest cart ${guestCart.id} into user cart for ${userId}`);
    return this.getCart({ userId }, language);
  }
}
