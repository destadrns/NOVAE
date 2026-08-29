import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WishlistItemDto, WishlistResponseDto } from './dto/wishlist.dto';
import { LanguageCode, ProductStatus } from '@prisma/client';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to format Prisma wishlist into standard WishlistResponseDto
   */
  private formatWishlist(
    wishlist: any,
    language: LanguageCode = LanguageCode.id,
  ): WishlistResponseDto {
    const items: WishlistItemDto[] = (wishlist.items || []).map((item: any) => {
      const product = item.product;
      const translation =
        product.translations?.find((t: any) => t.language === language) ||
        product.translations?.find((t: any) => t.language === LanguageCode.id) ||
        product.translations?.[0];

      const primaryImage =
        product.images?.find((img: any) => img.isPrimary)?.imageUrl ||
        product.images?.[0]?.imageUrl ||
        null;

      // Check if at least one active variant has available stock
      const hasStock = (product.variants || []).some((v: any) => {
        const inv = v.inventory;
        const available = inv ? inv.quantityOnHand - inv.reservedQuantity : 0;
        return available > 0 && v.status === 'active';
      });

      return {
        id: item.id,
        productId: product.id,
        slug: product.slug,
        name: translation?.name || product.slug,
        skuRoot: product.skuRoot,
        basePriceIdr: Number(product.basePriceIdr),
        imageUrl: primaryImage,
        status: product.status,
        isAvailable: hasStock && product.status === ProductStatus.active,
        categoryName: product.category?.name || null,
        collectionCode: product.collection?.code || null,
        createdAt: item.createdAt,
      };
    });

    return {
      id: wishlist.id,
      userId: wishlist.userId,
      itemCount: items.length,
      items,
    };
  }

  /**
   * Finds or provisions a wishlist for the user
   */
  async getOrCreateWishlist(userId: string): Promise<any> {
    const includeClause = {
      items: {
        include: {
          product: {
            include: {
              translations: true,
              images: true,
              category: true,
              collection: true,
              variants: {
                include: {
                  inventory: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' as const },
      },
    };

    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: includeClause,
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
        include: includeClause,
      });
    }

    return wishlist;
  }

  /**
   * Retrieves user wishlist
   */
  async getWishlist(userId: string, language?: LanguageCode): Promise<WishlistResponseDto> {
    const wishlist = await this.getOrCreateWishlist(userId);
    return this.formatWishlist(wishlist, language);
  }

  /**
   * Add a product to user wishlist
   */
  async addItem(
    userId: string,
    productId: string,
    language?: LanguageCode,
  ): Promise<WishlistResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }

    if (product.status !== ProductStatus.active) {
      throw new BadRequestException('Archived or inactive garments cannot be added to wishlist');
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    await this.prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: product.id,
        },
      },
      create: {
        wishlistId: wishlist.id,
        productId: product.id,
      },
      update: {},
    });

    return this.getWishlist(userId, language);
  }

  /**
   * Remove a product from user wishlist by product ID or wishlist item ID
   */
  async removeItem(
    userId: string,
    productIdOrItemId: string,
    language?: LanguageCode,
  ): Promise<WishlistResponseDto> {
    const wishlist = await this.getOrCreateWishlist(userId);

    await this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        OR: [
          { productId: productIdOrItemId },
          { id: productIdOrItemId },
        ],
      },
    });

    return this.getWishlist(userId, language);
  }

  /**
   * Clear all items from user wishlist
   */
  async clearWishlist(userId: string, language?: LanguageCode): Promise<WishlistResponseDto> {
    const wishlist = await this.getOrCreateWishlist(userId);

    await this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
      },
    });

    return this.getWishlist(userId, language);
  }
}
