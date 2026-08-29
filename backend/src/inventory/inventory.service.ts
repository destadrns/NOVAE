import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  AdminInventoryQueryDto,
  InventoryStatusFilter,
} from './dto/admin-inventory-query.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import {
  InventoryHealthStatus,
  InventoryItemDto,
  InventoryMovementItemDto,
  InventorySummaryMetricsDto,
  PaginatedInventoryResponseDto,
} from './dto/inventory-response.dto';
import { InventoryMovementType, Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Classifies stock health status based on available units vs threshold
   */
  classifyHealthStatus(available: number, threshold: number): InventoryHealthStatus {
    if (available <= 0) return 'OUT_OF_STOCK';
    if (available <= threshold) return 'LOW_STOCK';
    return 'IN_STOCK';
  }

  /**
   * Transforms raw Prisma entity into standard InventoryItemDto
   */
  mapToInventoryDto(inv: any): InventoryItemDto {
    const variant = inv.variant;
    const product = variant.product;
    const translation =
      product.translations?.find((t: any) => t.language === 'id') ||
      product.translations?.[0];

    const availableQuantity = inv.quantityOnHand - inv.reservedQuantity;
    const status = this.classifyHealthStatus(availableQuantity, inv.lowStockThreshold);

    return {
      id: inv.id,
      variantId: variant.id,
      sku: variant.sku,
      productName: translation?.name || product.slug,
      productId: product.id,
      productSlug: product.slug,
      colorName: variant.colorName,
      colorCode: variant.colorCode || null,
      size: variant.size,
      priceOverrideIdr: variant.priceOverrideIdr
        ? Number(variant.priceOverrideIdr)
        : null,
      basePriceIdr: Number(product.basePriceIdr),
      quantityOnHand: inv.quantityOnHand,
      reservedQuantity: inv.reservedQuantity,
      availableQuantity,
      lowStockThreshold: inv.lowStockThreshold,
      status,
      variantStatus: variant.status,
      category: product.category
        ? {
            id: product.category.id,
            slug: product.category.slug,
            name: product.category.name,
          }
        : null,
      collection: product.collection
        ? {
            id: product.collection.id,
            code: product.collection.code,
            slug: product.collection.slug,
            name: product.collection.name,
          }
        : null,
      updatedAt: inv.updatedAt,
    };
  }

  /**
   * Lists inventory with multifaceted filters, search, and summary metrics
   */
  async getInventory(
    query: AdminInventoryQueryDto,
  ): Promise<PaginatedInventoryResponseDto> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;

    // Build product and variant search filters
    const productWhere: Prisma.ProductWhereInput = {};

    if (query.category) {
      productWhere.category = {
        OR: [{ id: query.category }, { slug: query.category }],
      };
    }

    if (query.collection) {
      productWhere.collection = {
        OR: [{ id: query.collection }, { slug: query.collection }],
      };
    }

    const variantWhere: Prisma.ProductVariantWhereInput = {
      product: Object.keys(productWhere).length > 0 ? productWhere : undefined,
    };

    if (query.search) {
      const s = query.search.trim();
      variantWhere.OR = [
        { sku: { contains: s, mode: 'insensitive' } },
        { colorName: { contains: s, mode: 'insensitive' } },
        { size: { contains: s, mode: 'insensitive' } },
        {
          product: {
            OR: [
              { skuRoot: { contains: s, mode: 'insensitive' } },
              { slug: { contains: s, mode: 'insensitive' } },
              {
                translations: {
                  some: { name: { contains: s, mode: 'insensitive' } },
                },
              },
            ],
          },
        },
      ];
    }

    // Fetch all matching inventory rows with relations
    const rawItems = await this.prisma.inventory.findMany({
      where: {
        variant: variantWhere,
      },
      include: {
        variant: {
          include: {
            product: {
              include: {
                translations: true,
                category: true,
                collection: true,
              },
            },
          },
        },
      },
      orderBy: [
        { variant: { product: { createdAt: 'desc' } } },
        { variant: { sku: 'asc' } },
      ],
    });

    const allMapped = rawItems.map((item) => this.mapToInventoryDto(item));

    // Calculate full-dataset summary metrics
    const summary: InventorySummaryMetricsDto = {
      totalPieces: allMapped.reduce((acc, i) => acc + i.quantityOnHand, 0),
      inStockCount: allMapped.filter((i) => i.status === 'IN_STOCK').length,
      lowStockCount: allMapped.filter((i) => i.status === 'LOW_STOCK').length,
      outOfStockCount: allMapped.filter((i) => i.status === 'OUT_OF_STOCK').length,
    };

    // Filter by health status if specified
    let filteredItems = allMapped;
    if (query.status && query.status !== InventoryStatusFilter.ALL) {
      filteredItems = allMapped.filter((i) => i.status === query.status);
    }

    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = filteredItems.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      summary,
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
   * Retrieves all variants currently in low stock or out of stock condition
   */
  async getLowStockInventory(): Promise<InventoryItemDto[]> {
    const rawItems = await this.prisma.inventory.findMany({
      include: {
        variant: {
          include: {
            product: {
              include: {
                translations: true,
                category: true,
                collection: true,
              },
            },
          },
        },
      },
      orderBy: { quantityOnHand: 'asc' },
    });

    const mapped = rawItems.map((item) => this.mapToInventoryDto(item));
    return mapped.filter(
      (item) => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK',
    );
  }

  /**
   * Retrieves inventory details for a specific variant
   */
  async getVariantInventory(variantId: string): Promise<InventoryItemDto> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        inventory: true,
        product: {
          include: {
            translations: true,
            category: true,
            collection: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Product variant with ID '${variantId}' not found`);
    }

    let inventory = variant.inventory;
    if (!inventory) {
      // Auto-provision inventory row if absent
      inventory = await this.prisma.inventory.create({
        data: {
          variantId: variant.id,
          quantityOnHand: 0,
          reservedQuantity: 0,
          lowStockThreshold: 3,
        },
      });
    }

    return this.mapToInventoryDto({ ...inventory, variant });
  }

  /**
   * Performs transactional inventory adjustments with constraint verification and audit movement logging
   */
  async adjustStock(
    variantId: string,
    dto: AdjustInventoryDto,
    adminUser?: { id?: string; email?: string },
  ): Promise<InventoryItemDto> {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: { inventory: true },
      });

      if (!variant) {
        throw new NotFoundException(`Product variant with ID '${variantId}' not found`);
      }

      let currentInventory = variant.inventory;
      if (!currentInventory) {
        currentInventory = await tx.inventory.create({
          data: {
            variantId: variant.id,
            quantityOnHand: 0,
            reservedQuantity: 0,
            lowStockThreshold: 3,
          },
        });
      }

      const targetOnHand = currentInventory.quantityOnHand + dto.quantityDelta;
      if (targetOnHand < 0) {
        throw new BadRequestException(
          `Adjustment rejected: resulting quantity on hand cannot be negative (${currentInventory.quantityOnHand} + ${dto.quantityDelta} = ${targetOnHand})`,
        );
      }

      const targetAvailable = targetOnHand - currentInventory.reservedQuantity;
      if (targetAvailable < 0) {
        throw new BadRequestException(
          `Adjustment rejected: resulting stock (${targetOnHand}) is less than currently reserved quantity (${currentInventory.reservedQuantity}). Resulting available: ${targetAvailable}`,
        );
      }

      // Update inventory record
      const updatedInventory = await tx.inventory.update({
        where: { variantId },
        data: {
          quantityOnHand: targetOnHand,
          lowStockThreshold:
            dto.lowStockThreshold !== undefined ? dto.lowStockThreshold : undefined,
        },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  translations: true,
                  category: true,
                  collection: true,
                },
              },
            },
          },
        },
      });

      // Record audit log in inventory_movements
      await tx.inventoryMovement.create({
        data: {
          variantId,
          movementType: dto.movementType || InventoryMovementType.adjustment,
          quantityDelta: dto.quantityDelta,
          note: dto.note || null,
          referenceType: dto.referenceType || 'manual_adjustment',
          referenceId: dto.referenceId || null,
          createdBy: adminUser?.id || null,
        },
      });

      this.logger.log(
        `Inventory adjusted for SKU ${variant.sku}: delta=${dto.quantityDelta}, newOnHand=${targetOnHand}, by user=${adminUser?.email || adminUser?.id || 'system'}`,
      );

      return this.mapToInventoryDto(updatedInventory);
    });
  }

  /**
   * Retrieves chronological audit movement trail for a variant
   */
  async getVariantMovements(
    variantId: string,
  ): Promise<InventoryMovementItemDto[]> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException(`Product variant with ID '${variantId}' not found`);
    }

    const movements = await this.prisma.inventoryMovement.findMany({
      where: { variantId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return movements.map((m) => ({
      id: m.id,
      variantId: m.variantId,
      movementType: m.movementType,
      quantityDelta: m.quantityDelta,
      referenceType: m.referenceType,
      referenceId: m.referenceId,
      note: m.note,
      createdByName: m.user?.fullName || null,
      createdByEmail: m.user?.email || null,
      createdAt: m.createdAt,
    }));
  }
}
