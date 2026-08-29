import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VariantStatus } from '@prisma/client';

export class CreateVariantDto {
  @ApiProperty({ example: 'NV-JKT-001-BLK-L' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Obsidian Black' })
  @IsString()
  @IsNotEmpty()
  colorName: string;

  @ApiPropertyOptional({ example: '#0B0C0E' })
  @IsOptional()
  @IsString()
  colorCode?: string;

  @ApiProperty({ example: 'L' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiPropertyOptional({ example: 1950000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceOverrideIdr?: number;

  @ApiPropertyOptional({ enum: VariantStatus, default: VariantStatus.active })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus = VariantStatus.active;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  initialStock?: number = 0;
}
