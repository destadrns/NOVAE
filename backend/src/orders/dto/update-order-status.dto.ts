import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Target order status',
    enum: OrderStatus,
    example: 'paid',
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'Admin note for status change',
    example: 'Payment confirmed via bank transfer',
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({
    description: 'Tracking number for shipped orders',
    example: 'JNE-1234567890',
  })
  @IsString()
  @IsOptional()
  trackingNumber?: string;
}
