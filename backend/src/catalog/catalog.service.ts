import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GetProductsQueryDto, ProductSortOption } from './dto/get-products-query.dto';
import { PaginatedProductsDto } from './dto/response/paginated-products.dto';
import { ProductListItemDto, ProductColorDto } from './dto/response/product-list-item.dto';
import {
  ProductDetailDto,
  ProductVariantDto,
  ProductImageDto,
} from './dto/response/product-detail.dto';
import { CategoryDto } from './dto/response/category.dto';
import { CollectionDto } from './dto/response/collection.dto';
import { LanguageCode, Prisma, ProductStatus, VariantStatus } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all active product categories
   */
  async getCategories(): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder,
    }));
  }

  /**
   * List all published collections with localization
   */
  async getCollections(language: LanguageCode = LanguageCode.id): Promise<CollectionDto[]> {
    const collections = await this.prisma.collection.findMany({
      where: { status: 'published' },
      include: { translations: true },
      orderBy: { sortOrder: 'asc' },
    });

    return collections.map((col) => {
      const translation =
        col.translations.find((t) => t.language === language) ||
        col.translations.find((t) => t.language === LanguageCode.id) ||
        col.translations[0];

      return {
        id: col.id,
        code: col.code,
        slug: col.slug,
        name: translation?.name || col.name,
        description: translation?.description || col.description,
        coverImageUrl: col.coverImageUrl,
        sortOrder: col.sortOrder,
      };
    });
  }

  /**
   * Get collection detail by slug with localization
   */
  async getCollectionBySlug(
    slug: string,
    language: LanguageCode = LanguageCode.id,
  ): Promise<CollectionDto> {
    const collection = await this.prisma.collection.findFirst({
      where: {
        slug,
        status: 'published',
      },
      include: { translations: true },
    });

    if (!collection) {
      throw new NotFoundException(`Collection '${slug}' not found`);
    }

    const translation =
      collection.translations.find((t) => t.language === language) ||
      collection.translations.find((t) => t.language === LanguageCode.id) ||
      collection.translations[0];

    return {
      id: collection.id,
      code: collection.code,
      slug: collection.slug,
      name: translation?.name || collection.name,
      description: translation?.description || collection.description,
      coverImageUrl: collection.coverImageUrl,
      sortOrder: collection.sortOrder,
    };
  }

  /**
   * Query and filter paginated products
   */
  async getProducts(query: GetProductsQueryDto): Promise<PaginatedProductsDto> {
    const language = query.language || LanguageCode.id;
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.active,
    };

    // Filter by Category
    if (query.category) {
      where.category = {
        slug: query.category.toLowerCase(),
      };
    }

    // Filter by Collection (slug or code)
    if (query.collection) {
      where.collection = {
        OR: [
          { slug: query.collection.toLowerCase() },
          { code: query.collection.toUpperCase() },
        ],
      };
    }

    // Price range filters
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePriceIdr = {};
      if (query.minPrice !== undefined) {
        where.basePriceIdr.gte = BigInt(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.basePriceIdr.lte = BigInt(query.maxPrice);
      }
    }

    // Filter by Variant Size
    if (query.size) {
      where.variants = {
        some: {
          size: query.size,
          status: VariantStatus.active,
        },
      };
    }

    // Filter by Variant Color
    if (query.color) {
      const existingVariantsFilter = where.variants?.some || {};
      where.variants = {
        some: {
          ...existingVariantsFilter,
          colorName: {
            contains: query.color,
            mode: 'insensitive',
          },
          status: VariantStatus.active,
        },
      };
    }

    // Filter by Tags
    if (query.tags) {
      const tagList = query.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (tagList.length > 0) {
        where.tagMaps = {
          some: {
            tag: {
              name: {
                in: tagList,
                mode: 'insensitive',
              },
            },
          },
        };
      }
    }

    // Free text search
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { slug: { contains: term, mode: 'insensitive' } },
        { skuRoot: { contains: term, mode: 'insensitive' } },
        {
          translations: {
            some: {
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { shortDescription: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      { featuredRank: 'asc' },
      { createdAt: 'desc' },
    ];

    if (query.sort === ProductSortOption.NEWEST) {
      orderBy = [{ createdAt: 'desc' }];
    } else if (query.sort === ProductSortOption.PRICE_ASC) {
      orderBy = [{ basePriceIdr: 'asc' }];
    } else if (query.sort === ProductSortOption.PRICE_DESC) {
      orderBy = [{ basePriceIdr: 'desc' }];
    }

    const [totalItems, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          collection: {
            include: { translations: true },
          },
          translations: true,
          variants: {
            include: { inventory: true },
          },
          tagMaps: {
            include: { tag: true },
          },
        },
      }),
    ]);

    const data: ProductListItemDto[] = products.map((prod) => {
      const translation =
        prod.translations.find((t) => t.language === language) ||
        prod.translations.find((t) => t.language === LanguageCode.id) ||
        prod.translations[0];

      const collectionTranslation = prod.collection
        ? prod.collection.translations.find((t) => t.language === language) ||
          prod.collection.translations.find((t) => t.language === LanguageCode.id) ||
          prod.collection.translations[0]
        : null;

      // Extract unique colors
      const colorMap = new Map<string, ProductColorDto>();
      prod.variants.forEach((v) => {
        if (!colorMap.has(v.colorName)) {
          colorMap.set(v.colorName, {
            name: v.colorName,
            code: v.colorCode,
          });
        }
      });

      // Extract unique sizes
      const sizeSet = new Set<string>();
      prod.variants.forEach((v) => sizeSet.add(v.size));

      // Calculate in-stock status
      const inStock = prod.variants.some((v) => {
        if (!v.inventory) return false;
        return v.inventory.quantityOnHand - v.inventory.reservedQuantity > 0;
      });

      return {
        id: prod.id,
        skuRoot: prod.skuRoot,
        slug: prod.slug,
        name: translation?.name || prod.slug,
        shortDescription: translation?.shortDescription || null,
        basePriceIdr: Number(prod.basePriceIdr),
        categorySlug: prod.category.slug,
        categoryName: prod.category.name,
        collectionSlug: prod.collection?.slug || null,
        collectionName: collectionTranslation?.name || prod.collection?.name || null,
        primaryImageUrl: prod.primaryImageUrl,
        featured: prod.featured,
        isNewDrop: prod.isNewDrop,
        limitedRun: prod.limitedRun,
        colors: Array.from(colorMap.values()),
        sizes: Array.from(sizeSet.values()),
        tags: prod.tagMaps.map((tm) => tm.tag.name),
        inStock,
      };
    });

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get single product detail by slug
   */
  async getProductBySlug(
    slug: string,
    language: LanguageCode = LanguageCode.id,
  ): Promise<ProductDetailDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.active,
      },
      include: {
        category: true,
        collection: {
          include: { translations: true },
        },
        translations: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          include: { inventory: true },
          orderBy: { createdAt: 'asc' },
        },
        tagMaps: {
          include: { tag: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product '${slug}' not found`);
    }

    const translation =
      product.translations.find((t) => t.language === language) ||
      product.translations.find((t) => t.language === LanguageCode.id) ||
      product.translations[0];

    const collectionTranslation = product.collection
      ? product.collection.translations.find((t) => t.language === language) ||
        product.collection.translations.find((t) => t.language === LanguageCode.id) ||
        product.collection.translations[0]
      : null;

    // Build customer-safe variants
    const variants: ProductVariantDto[] = product.variants.map((v) => {
      const availableQuantity = v.inventory
        ? Math.max(0, v.inventory.quantityOnHand - v.inventory.reservedQuantity)
        : 0;

      return {
        id: v.id,
        sku: v.sku,
        colorName: v.colorName,
        colorCode: v.colorCode,
        size: v.size,
        priceIdr: Number(v.priceOverrideIdr || product.basePriceIdr),
        inStock: availableQuantity > 0,
        availableQuantity,
        imageUrl: v.imageUrl,
      };
    });

    // Extract unique colors
    const colorMap = new Map<string, ProductColorDto>();
    product.variants.forEach((v) => {
      if (!colorMap.has(v.colorName)) {
        colorMap.set(v.colorName, {
          name: v.colorName,
          code: v.colorCode,
        });
      }
    });

    // Extract unique sizes
    const sizeSet = new Set<string>();
    product.variants.forEach((v) => sizeSet.add(v.size));

    // Images
    const images: ProductImageDto[] = product.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      altText: img.altText,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
      variantId: img.variantId,
    }));

    const isPurchasable = variants.some((v) => v.inStock);

    return {
      id: product.id,
      skuRoot: product.skuRoot,
      slug: product.slug,
      name: translation?.name || product.slug,
      shortDescription: translation?.shortDescription || null,
      description: translation?.description || null,
      materialDescription: translation?.materialDescription || null,
      provenanceText: translation?.provenanceText || null,
      basePriceIdr: Number(product.basePriceIdr),
      category: {
        id: product.category.id,
        slug: product.category.slug,
        name: product.category.name,
      },
      collection: product.collection
        ? {
            id: product.collection.id,
            code: product.collection.code,
            slug: product.collection.slug,
            name: collectionTranslation?.name || product.collection.name,
          }
        : null,
      primaryImageUrl: product.primaryImageUrl,
      featured: product.featured,
      isNewDrop: product.isNewDrop,
      limitedRun: product.limitedRun,
      isPurchasable,
      colors: Array.from(colorMap.values()),
      sizes: Array.from(sizeSet.values()),
      tags: product.tagMaps.map((tm) => tm.tag.name),
      images,
      variants,
    };
  }
}
