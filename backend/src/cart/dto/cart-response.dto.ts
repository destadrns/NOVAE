import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ example: '00000000-0000-0000-0008-000000000001' })
  id: string;

  @ApiProperty({ example: '00000000-0000-0000-0006-000000000001' })
  variantId: string;

  @ApiProperty({ example: '00000000-0000-0000-0005-000000000001' })
  productId: string;

  @ApiProperty({ example: 'oversized-form-jacket' })
  productSlug: string;

  @ApiProperty({ example: 'Oversized Form Jacket' })
  productName: string;

  @ApiProperty({ example: 'Raw Indigo' })
  colorName: string;

  @ApiPropertyOptional({ example: '#1C2333' })
  colorCode?: string | null;

  @ApiProperty({ example: 'S' })
  size: string;

  @ApiProperty({ example: 'NV-JKT-001-RAW-S' })
  sku: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  imageUrl?: string | null;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 1850000 })
  unitPriceIdr: number;

  @ApiProperty({ example: 1850000 })
  totalPriceIdr: number;

  @ApiProperty({ example: 8 })
  availableQuantity: number;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiProperty({ example: false })
  isLowStock: boolean;

  @ApiProperty({ example: false })
  isOutOfStock: boolean;

  @ApiProperty({ example: '2026-08-30T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-30T00:00:00.000Z' })
  updatedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({ example: '00000000-0000-0000-0007-000000000001' })
  id: string;

  @ApiPropertyOptional({ example: '00000000-0000-0000-0001-000000000001' })
  userId?: string | null;

  @ApiPropertyOptional({ example: 'session-guest-uuid-12345' })
  sessionKey?: string | null;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 'IDR' })
  currency: string;

  @ApiProperty({ example: 2 })
  itemCount: number;

  @ApiProperty({ example: 3700000 })
  subtotalIdr: number;

  @ApiProperty({ example: 3700000 })
  totalIdr: number;

  @ApiProperty({ type: [CartItemDto] })
  items: CartItemDto[];

  @ApiProperty({ example: '2026-08-30T00:00:00.000Z' })
  updatedAt: Date;
}
