import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty({ description: 'Order item unique identifier' })
  id: string;

  @ApiProperty({ description: 'Product unique identifier' })
  productId: string;

  @ApiProperty({ description: 'Variant unique identifier' })
  variantId: string;

  @ApiProperty({ description: 'Snapshot product name at time of order' })
  productName: string;

  @ApiProperty({ description: 'Snapshot SKU code' })
  sku: string;

  @ApiPropertyOptional({ description: 'Snapshot color name' })
  colorName?: string | null;

  @ApiPropertyOptional({ description: 'Snapshot size' })
  size?: string | null;

  @ApiProperty({ description: 'Unit price in IDR' })
  unitPriceIdr: number;

  @ApiProperty({ description: 'Ordered quantity' })
  quantity: number;

  @ApiProperty({ description: 'Line total price in IDR' })
  lineTotalIdr: number;

  @ApiPropertyOptional({ description: 'Product thumbnail image URL' })
  imageUrl?: string | null;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order UUID' })
  id: string;

  @ApiProperty({ description: 'Human-readable unique order number', example: 'NOV-2026-0109' })
  orderNumber: string;

  @ApiProperty({ enum: OrderStatus, description: 'Current order lifecycle status' })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus, description: 'Current payment status' })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: FulfillmentStatus, description: 'Current fulfillment status' })
  fulfillmentStatus: FulfillmentStatus;

  @ApiProperty({ description: 'Subtotal in IDR before shipping and taxes' })
  subtotalIdr: number;

  @ApiProperty({ description: 'Shipping cost in IDR' })
  shippingIdr: number;

  @ApiProperty({ description: 'Tax amount in IDR' })
  taxIdr: number;

  @ApiProperty({ description: 'Discount amount in IDR' })
  discountIdr: number;

  @ApiProperty({ description: 'Total authoritative order amount in IDR' })
  totalIdr: number;

  @ApiProperty({ description: 'Order currency', example: 'IDR' })
  currency: string;

  @ApiProperty({ description: 'Customer contact email' })
  customerEmail: string;

  @ApiProperty({ description: 'Snapshot of shipping address and courier info' })
  shippingAddress: any;

  @ApiProperty({ description: 'List of snapshotted order line items', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ description: 'Timestamp when order was placed' })
  placedAt: Date | null;

  @ApiProperty({ description: 'Timestamp when order record was created' })
  createdAt: Date;
}
