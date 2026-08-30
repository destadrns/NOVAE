import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, FulfillmentStatus, ShipmentStatus } from '@prisma/client';

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

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment UUID' })
  id: string;

  @ApiProperty({ description: 'Payment provider identifier', example: 'manual' })
  provider: string;

  @ApiPropertyOptional({ description: 'Payment method', example: 'bca_va' })
  method?: string | null;

  @ApiProperty({ description: 'Payment amount in IDR' })
  amountIdr: number;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment transaction status' })
  status: PaymentStatus;

  @ApiPropertyOptional({ description: 'Timestamp when payment was confirmed paid' })
  paidAt?: Date | null;
}

export class ShipmentResponseDto {
  @ApiProperty({ description: 'Shipment UUID' })
  id: string;

  @ApiPropertyOptional({ description: 'Logistics courier name', example: 'JNE Express' })
  courier?: string | null;

  @ApiPropertyOptional({ description: 'Courier service tier', example: 'REG' })
  service?: string | null;

  @ApiPropertyOptional({ description: 'Waybill tracking number', example: 'NV-EXP-0109-8821' })
  trackingNumber?: string | null;

  @ApiProperty({ enum: ShipmentStatus, description: 'Current shipment tracking status' })
  status: ShipmentStatus;

  @ApiPropertyOptional({ description: 'Timestamp when package was dispatched' })
  shippedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Timestamp when package was delivered' })
  deliveredAt?: Date | null;
}

export class OrderStatusHistoryResponseDto {
  @ApiProperty({ description: 'History record UUID' })
  id: string;

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Previous order status' })
  fromStatus?: OrderStatus | null;

  @ApiProperty({ enum: OrderStatus, description: 'New order status' })
  toStatus: OrderStatus;

  @ApiPropertyOptional({ description: 'Audit trail or transition note' })
  note?: string | null;

  @ApiProperty({ description: 'Timestamp of status transition' })
  createdAt: Date;
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

  @ApiProperty({ description: 'List of snapshotted order line items', type: () => [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiPropertyOptional({ description: 'Payment records and status', type: () => [PaymentResponseDto] })
  payments?: PaymentResponseDto[];

  @ApiPropertyOptional({ description: 'Shipment and tracking details', type: () => ShipmentResponseDto })
  shipment?: ShipmentResponseDto | null;

  @ApiPropertyOptional({ description: 'Historical status transition timeline', type: () => [OrderStatusHistoryResponseDto] })
  statusHistory?: OrderStatusHistoryResponseDto[];

  @ApiProperty({ description: 'Timestamp when order was placed' })
  placedAt: Date | null;

  @ApiProperty({ description: 'Timestamp when order record was created' })
  createdAt: Date;
}
