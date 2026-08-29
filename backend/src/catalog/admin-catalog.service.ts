import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/admin/create-product.dto';
import { UpdateProductDto } from './dto/admin/update-product.dto';
import { CreateVariantDto } from './dto/admin/create-variant.dto';
import { UpdateVariantDto } from './dto/admin/update-variant.dto';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/admin/create-collection.dto';
import { AdminProductsQueryDto } from './dto/admin/admin-products-query.dto';
import { Prisma, ProductStatus, VariantStatus } from '@prisma/client';

@Injectable()
export class AdminCatalogService {
  private readonly logger = new Logger(AdminCatalogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all products for admin with pagination, filters, and inventory stats
   */
  async getAdminProducts(query: AdminProductsQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = { slug: query.category.toLowerCase() };
    }

    if (query.collection) {
      where.collection = {
        OR: [
          { slug: query.collection.toLowerCase() },
          { code: query.collection.toUpperCase() },
        ],
      };
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { slug: { contains: term, mode: 'insensitive' } },
        { skuRoot: { contains: term, mode: 'insensitive' } },
        {
          translations: {
            some: {
              name: { contains: term, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const [totalItems, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          category: true,
          collection: true,
          translations: true,
          variants: {
            include: { inventory: true },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          tagMaps: {
            include: { tag: true },
          },
        },
      }),
    ]);

    const data = products.map((prod) => {
      const idTranslation = prod.translations.find((t) => t.language === 'id');
      const enTranslation = prod.translations.find((t) => t.language === 'en');
      const totalStock = prod.variants.reduce(
        (sum, v) => sum + (v.inventory?.quantityOnHand || 0),
        0,
      );

      return {
        id: prod.id,
        skuRoot: prod.skuRoot,
        slug: prod.slug,
        name: idTranslation?.name || enTranslation?.name || prod.slug,
        translations: prod.translations,
        basePriceIdr: Number(prod.basePriceIdr),
        status: prod.status,
        featured: prod.featured,
        isNewDrop: prod.isNewDrop,
        limitedRun: prod.limitedRun,
        primaryImageUrl: prod.primaryImageUrl,
        category: prod.category,
        collection: prod.collection,
        totalStock,
        variantsCount: prod.variants.length,
        variants: prod.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          colorName: v.colorName,
          colorCode: v.colorCode,
          size: v.size,
          priceOverrideIdr: v.priceOverrideIdr ? Number(v.priceOverrideIdr) : null,
          status: v.status,
          stock: v.inventory?.quantityOnHand || 0,
        })),
        tags: prod.tagMaps.map((tm) => tm.tag.name),
        createdAt: prod.createdAt,
        updatedAt: prod.updatedAt,
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
   * Get complete product detail by ID for admin inspection/editing
   */
  async getAdminProductById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        collection: true,
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
      throw new NotFoundException(`Product with ID/Slug '${id}' not found`);
    }

    return {
      ...product,
      basePriceIdr: Number(product.basePriceIdr),
      variants: product.variants.map((v) => ({
        ...v,
        priceOverrideIdr: v.priceOverrideIdr ? Number(v.priceOverrideIdr) : null,
        stock: v.inventory?.quantityOnHand || 0,
      })),
      tags: product.tagMaps.map((tm) => tm.tag.name),
    };
  }

  /**
   * Create new product with translations, tags, images, and initial variants in a transaction
   */
  async createProduct(dto: CreateProductDto) {
    // 1. Uniqueness check
    const existing = await this.prisma.product.findFirst({
      where: {
        OR: [{ skuRoot: dto.skuRoot }, { slug: dto.slug }],
      },
    });

    if (existing) {
      throw new ConflictException(
        `Product with SKU root '${dto.skuRoot}' or slug '${dto.slug}' already exists`,
      );
    }

    // 2. Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(`Category with ID '${dto.categoryId}' does not exist`);
    }

    // 3. Validate collection if provided
    if (dto.collectionId) {
      const collection = await this.prisma.collection.findUnique({
        where: { id: dto.collectionId },
      });
      if (!collection) {
        throw new BadRequestException(`Collection with ID '${dto.collectionId}' does not exist`);
      }
    }

    // 4. Execute atomic transaction
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          skuRoot: dto.skuRoot,
          slug: dto.slug,
          categoryId: dto.categoryId,
          collectionId: dto.collectionId,
          basePriceIdr: BigInt(dto.basePriceIdr),
          status: dto.status || ProductStatus.draft,
          featured: dto.featured || false,
          isNewDrop: dto.isNewDrop || false,
          limitedRun: dto.limitedRun || false,
          featuredRank: dto.featuredRank,
          primaryImageUrl: dto.primaryImageUrl,
          translations: {
            create: dto.translations.map((t) => ({
              language: t.language,
              name: t.name,
              shortDescription: t.shortDescription,
              description: t.description,
              materialDescription: t.materialDescription,
              provenanceText: t.provenanceText,
            })),
          },
        },
      });

      // Handle tags
      if (dto.tags && dto.tags.length > 0) {
        for (const tagName of dto.tags) {
          const trimmed = tagName.trim();
          if (!trimmed) continue;

          let tag = await tx.productTag.findUnique({
            where: { name: trimmed },
          });

          if (!tag) {
            tag = await tx.productTag.create({
              data: { name: trimmed },
            });
          }

          await tx.productTagMap.create({
            data: {
              productId: product.id,
              tagId: tag.id,
            },
          });
        }
      }

      // Handle images
      if (dto.images && dto.images.length > 0) {
        for (let i = 0; i < dto.images.length; i++) {
          const img = dto.images[i];
          await tx.productImage.create({
            data: {
              productId: product.id,
              imageUrl: img.imageUrl,
              altText: img.altText,
              sortOrder: img.sortOrder !== undefined ? img.sortOrder : i,
              isPrimary: img.isPrimary || false,
            },
          });
        }
      }

      // Handle variants
      if (dto.variants && dto.variants.length > 0) {
        for (const v of dto.variants) {
          const variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: v.sku,
              colorName: v.colorName,
              colorCode: v.colorCode,
              size: v.size,
              priceOverrideIdr: v.priceOverrideIdr ? BigInt(v.priceOverrideIdr) : null,
              status: v.status || VariantStatus.active,
              imageUrl: v.imageUrl,
            },
          });

          await tx.inventory.create({
            data: {
              variantId: variant.id,
              quantityOnHand: v.initialStock || 0,
              reservedQuantity: 0,
            },
          });
        }
      }

      this.logger.log(`Created product: ${product.skuRoot} (${product.id})`);
      return {
        ...product,
        basePriceIdr: Number(product.basePriceIdr),
      };
    });
  }

  /**
   * Update existing product attributes, translations, and tag associations
   */
  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    if (dto.skuRoot && dto.skuRoot !== product.skuRoot) {
      const existing = await this.prisma.product.findUnique({
        where: { skuRoot: dto.skuRoot },
      });
      if (existing) {
        throw new ConflictException(`SKU root '${dto.skuRoot}' already in use`);
      }
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`Slug '${dto.slug}' already in use`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.ProductUpdateInput = {};

      if (dto.skuRoot) updateData.skuRoot = dto.skuRoot;
      if (dto.slug) updateData.slug = dto.slug;
      if (dto.basePriceIdr !== undefined) updateData.basePriceIdr = BigInt(dto.basePriceIdr);
      if (dto.status) updateData.status = dto.status;
      if (dto.featured !== undefined) updateData.featured = dto.featured;
      if (dto.isNewDrop !== undefined) updateData.isNewDrop = dto.isNewDrop;
      if (dto.limitedRun !== undefined) updateData.limitedRun = dto.limitedRun;
      if (dto.featuredRank !== undefined) updateData.featuredRank = dto.featuredRank;
      if (dto.primaryImageUrl !== undefined) updateData.primaryImageUrl = dto.primaryImageUrl;

      if (dto.categoryId) {
        updateData.category = { connect: { id: dto.categoryId } };
      }
      if (dto.collectionId !== undefined) {
        updateData.collection = dto.collectionId ? { connect: { id: dto.collectionId } } : { disconnect: true };
      }

      const updated = await tx.product.update({
        where: { id },
        data: updateData,
      });

      // Update translations
      if (dto.translations) {
        for (const t of dto.translations) {
          await tx.productTranslation.upsert({
            where: {
              productId_language: {
                productId: id,
                language: t.language,
              },
            },
            update: {
              name: t.name,
              shortDescription: t.shortDescription,
              description: t.description,
              materialDescription: t.materialDescription,
              provenanceText: t.provenanceText,
            },
            create: {
              productId: id,
              language: t.language,
              name: t.name,
              shortDescription: t.shortDescription,
              description: t.description,
              materialDescription: t.materialDescription,
              provenanceText: t.provenanceText,
            },
          });
        }
      }

      // Update tags if provided
      if (dto.tags !== undefined) {
        await tx.productTagMap.deleteMany({ where: { productId: id } });
        for (const tagName of dto.tags) {
          const trimmed = tagName.trim();
          if (!trimmed) continue;

          let tag = await tx.productTag.findUnique({
            where: { name: trimmed },
          });

          if (!tag) {
            tag = await tx.productTag.create({ data: { name: trimmed } });
          }

          await tx.productTagMap.create({
            data: { productId: id, tagId: tag.id },
          });
        }
      }

      this.logger.log(`Updated product: ${updated.skuRoot} (${updated.id})`);
      return {
        ...updated,
        basePriceIdr: Number(updated.basePriceIdr),
      };
    });
  }

  /**
   * Archive product (soft-delete / status=archived)
   */
  async archiveProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.archived },
    });

    this.logger.log(`Archived product: ${product.skuRoot} (${id})`);
    return {
      message: 'Product archived successfully',
      id: updated.id,
      status: updated.status,
    };
  }

  /**
   * Create a new variant for a product
   */
  async createVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }

    // Check SKU uniqueness
    const existingSku = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new ConflictException(`Variant SKU '${dto.sku}' already in use`);
    }

    // Check Product + Color + Size uniqueness
    const existingCombo = await this.prisma.productVariant.findUnique({
      where: {
        productId_colorName_size: {
          productId,
          colorName: dto.colorName,
          size: dto.size,
        },
      },
    });
    if (existingCombo) {
      throw new ConflictException(
        `Variant with color '${dto.colorName}' and size '${dto.size}' already exists for this product`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          sku: dto.sku,
          colorName: dto.colorName,
          colorCode: dto.colorCode,
          size: dto.size,
          priceOverrideIdr: dto.priceOverrideIdr ? BigInt(dto.priceOverrideIdr) : null,
          status: dto.status || VariantStatus.active,
          imageUrl: dto.imageUrl,
        },
      });

      await tx.inventory.create({
        data: {
          variantId: variant.id,
          quantityOnHand: dto.initialStock || 0,
          reservedQuantity: 0,
        },
      });

      this.logger.log(`Created variant: ${variant.sku} for product: ${productId}`);
      return {
        ...variant,
        priceOverrideIdr: variant.priceOverrideIdr ? Number(variant.priceOverrideIdr) : null,
      };
    });
  }

  /**
   * Update existing variant
   */
  async updateVariant(id: string, dto: UpdateVariantDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID '${id}' not found`);
    }

    if (dto.sku && dto.sku !== variant.sku) {
      const existing = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku },
      });
      if (existing) {
        throw new ConflictException(`Variant SKU '${dto.sku}' already in use`);
      }
    }

    const nextColor = dto.colorName || variant.colorName;
    const nextSize = dto.size || variant.size;

    if (nextColor !== variant.colorName || nextSize !== variant.size) {
      const existingCombo = await this.prisma.productVariant.findUnique({
        where: {
          productId_colorName_size: {
            productId: variant.productId,
            colorName: nextColor,
            size: nextSize,
          },
        },
      });
      if (existingCombo && existingCombo.id !== id) {
        throw new ConflictException(
          `Variant with color '${nextColor}' and size '${nextSize}' already exists for this product`,
        );
      }
    }

    const updateData: Prisma.ProductVariantUpdateInput = {};
    if (dto.sku) updateData.sku = dto.sku;
    if (dto.colorName) updateData.colorName = dto.colorName;
    if (dto.colorCode !== undefined) updateData.colorCode = dto.colorCode;
    if (dto.size) updateData.size = dto.size;
    if (dto.priceOverrideIdr !== undefined) {
      updateData.priceOverrideIdr = dto.priceOverrideIdr ? BigInt(dto.priceOverrideIdr) : null;
    }
    if (dto.status) updateData.status = dto.status;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;

    const updated = await this.prisma.productVariant.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Updated variant: ${updated.sku} (${id})`);
    return {
      ...updated,
      priceOverrideIdr: updated.priceOverrideIdr ? Number(updated.priceOverrideIdr) : null,
    };
  }

  /**
   * Delete variant or soft-deactivate if referenced in orders
   */
  async deleteVariant(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID '${id}' not found`);
    }

    if (variant.orderItems && variant.orderItems.length > 0) {
      // Soft-deactivate to prevent breaking order history foreign keys
      const updated = await this.prisma.productVariant.update({
        where: { id },
        data: { status: VariantStatus.inactive },
      });
      this.logger.log(`Soft-deactivated variant with existing order items: ${variant.sku}`);
      return {
        message: 'Variant deactivated (referenced in order history)',
        id: updated.id,
        status: updated.status,
      };
    }

    // Safe to delete completely
    await this.prisma.productVariant.delete({ where: { id } });
    this.logger.log(`Deleted variant: ${variant.sku}`);
    return {
      message: 'Variant deleted successfully',
      id,
    };
  }

  /**
   * List all collections for admin
   */
  async getAdminCollections() {
    const collections = await this.prisma.collection.findMany({
      include: {
        translations: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return collections.map((col) => ({
      id: col.id,
      code: col.code,
      slug: col.slug,
      name: col.name,
      description: col.description,
      coverImageUrl: col.coverImageUrl,
      status: col.status,
      sortOrder: col.sortOrder,
      productsCount: col._count.products,
      translations: col.translations,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
    }));
  }

  /**
   * Create collection with translations
   */
  async createCollection(dto: CreateCollectionDto) {
    const existing = await this.prisma.collection.findFirst({
      where: {
        OR: [{ code: dto.code }, { slug: dto.slug }],
      },
    });

    if (existing) {
      throw new ConflictException(`Collection with code '${dto.code}' or slug '${dto.slug}' already exists`);
    }

    return this.prisma.$transaction(async (tx) => {
      return tx.collection.create({
        data: {
          code: dto.code,
          slug: dto.slug,
          name: dto.name,
          description: dto.description,
          coverImageUrl: dto.coverImageUrl,
          status: dto.status,
          sortOrder: dto.sortOrder || 0,
          translations: {
            create: dto.translations?.map((t) => ({
              language: t.language,
              name: t.name,
              description: t.description,
            })),
          },
        },
      });
    });
  }

  /**
   * Update collection and translations
   */
  async updateCollection(id: string, dto: UpdateCollectionDto) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID '${id}' not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.CollectionUpdateInput = {};
      if (dto.code) updateData.code = dto.code;
      if (dto.slug) updateData.slug = dto.slug;
      if (dto.name) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.coverImageUrl !== undefined) updateData.coverImageUrl = dto.coverImageUrl;
      if (dto.status) updateData.status = dto.status;
      if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

      const updated = await tx.collection.update({
        where: { id },
        data: updateData,
      });

      if (dto.translations) {
        for (const t of dto.translations) {
          await tx.collectionTranslation.upsert({
            where: {
              collectionId_language: {
                collectionId: id,
                language: t.language,
              },
            },
            update: {
              name: t.name,
              description: t.description,
            },
            create: {
              collectionId: id,
              language: t.language,
              name: t.name,
              description: t.description,
            },
          });
        }
      }

      return updated;
    });
  }

  /**
   * Delete collection
   */
  async deleteCollection(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID '${id}' not found`);
    }

    await this.prisma.collection.delete({ where: { id } });
    return {
      message: 'Collection deleted successfully',
      id,
    };
  }
}
