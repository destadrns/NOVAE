import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryMovementType, VariantStatus } from '@prisma/client';

export type InventoryHealthStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export class InventoryItemDto {
  @ApiProperty({ example: '00000000-0000-0000-0006-000000000001' })
  id: string;

  @ApiProperty({ example: '00000000-0000-0000-0006-000000000001' })
  variantId: string;

  @ApiProperty({ example: 'NV-JKT-001-RAW-S' })
  sku: string;

  @ApiProperty({ example: 'Oversized Form Jacket' })
  productName: string;

  @ApiProperty({ example: '00000000-0000-0000-0005-000000000001' })
  productId: string;

  @ApiProperty({ example: 'oversized-form-jacket' })
  productSlug: string;

  @ApiProperty({ example: 'Raw Indigo' })
  colorName: string;

  @ApiPropertyOptional({ example: '#1C2333' })
  colorCode?: string | null;

  @ApiProperty({ example: 'S' })
  size: string;

  @ApiPropertyOptional({ example: 1850000 })
  priceOverrideIdr?: number | null;

  @ApiProperty({ example: 1850000 })
  basePriceIdr: number;

  @ApiProperty({ example: 10 })
  quantityOnHand: number;

  @ApiProperty({ example: 2 })
  reservedQuantity: number;

  @ApiProperty({ example: 8 })
  availableQuantity: number;

  @ApiProperty({ example: 3 })
  lowStockThreshold: number;

  @ApiProperty({ enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'], example: 'IN_STOCK' })
  status: InventoryHealthStatus;

  @ApiProperty({ enum: VariantStatus, example: VariantStatus.active })
  variantStatus: VariantStatus;

  @ApiPropertyOptional()
  category?: {
    id: string;
    slug: string;
    name: string;
  } | null;

  @ApiPropertyOptional()
  collection?: {
    id: string;
    code: string;
    slug: string;
    name: string;
  } | null;

  @ApiProperty({ example: '2026-08-30T00:00:00.000Z' })
  updatedAt: Date;
}

export class InventoryMovementItemDto {
  @ApiProperty({ example: '00000000-0000-0000-0007-000000000001' })
  id: string;

  @ApiProperty({ example: '00000000-0000-0000-0006-000000000001' })
  variantId: string;

  @ApiProperty({ enum: InventoryMovementType, example: InventoryMovementType.restock })
  movementType: InventoryMovementType;

  @ApiProperty({ example: 10 })
  quantityDelta: number;

  @ApiPropertyOptional({ example: 'manual_adjustment' })
  referenceType?: string | null;

  @ApiPropertyOptional({ example: '00000000-0000-0000-0000-000000000001' })
  referenceId?: string | null;

  @ApiPropertyOptional({ example: 'Batch arrival from atelier' })
  note?: string | null;

  @ApiPropertyOptional({ example: 'Madame Direktris' })
  createdByName?: string | null;

  @ApiPropertyOptional({ example: 'admin@novae.atelier' })
  createdByEmail?: string | null;

  @ApiProperty({ example: '2026-08-30T00:00:00.000Z' })
  createdAt: Date;
}

export class InventorySummaryMetricsDto {
  @ApiProperty({ example: 99 })
  totalPieces: number;

  @ApiProperty({ example: 15 })
  inStockCount: number;

  @ApiProperty({ example: 2 })
  lowStockCount: number;

  @ApiProperty({ example: 1 })
  outOfStockCount: number;
}

export class PaginatedInventoryResponseDto {
  @ApiProperty({ type: [InventoryItemDto] })
  data: InventoryItemDto[];

  @ApiProperty({ type: InventorySummaryMetricsDto })
  summary: InventorySummaryMetricsDto;

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
