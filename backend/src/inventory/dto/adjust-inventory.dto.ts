import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  NotEquals,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryMovementType } from '@prisma/client';

export class AdjustInventoryDto {
  @ApiProperty({
    example: 10,
    description: 'Stock quantity adjustment delta (positive to add, negative to reduce, non-zero)',
  })
  @Type(() => Number)
  @IsInt()
  @NotEquals(0, { message: 'quantityDelta must not be 0' })
  @IsNotEmpty()
  quantityDelta: number;

  @ApiPropertyOptional({
    enum: InventoryMovementType,
    default: InventoryMovementType.adjustment,
    description: 'Type of inventory movement to log',
  })
  @IsOptional()
  @IsEnum(InventoryMovementType)
  movementType?: InventoryMovementType = InventoryMovementType.adjustment;

  @ApiPropertyOptional({
    example: 'Seasonal batch delivery from atelier',
    description: 'Audit note or reason for adjustment',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Optional update to variant low-stock threshold',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({
    example: 'manual_adjustment',
    description: 'Reference entity type (e.g. po_inbound, stocktake, return_claim)',
  })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({
    example: '00000000-0000-0000-0000-000000000001',
    description: 'Reference entity UUID if applicable',
  })
  @IsOptional()
  @IsUUID('all')
  referenceId?: string;
}
