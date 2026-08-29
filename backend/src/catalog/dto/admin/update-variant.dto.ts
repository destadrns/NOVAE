import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VariantStatus } from '@prisma/client';

export class UpdateVariantDto {
  @ApiPropertyOptional({ example: 'NV-JKT-001-BLK-L' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: 'Obsidian Black' })
  @IsOptional()
  @IsString()
  colorName?: string;

  @ApiPropertyOptional({ example: '#0B0C0E' })
  @IsOptional()
  @IsString()
  colorCode?: string;

  @ApiPropertyOptional({ example: 'L' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ example: 1950000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceOverrideIdr?: number | null;

  @ApiPropertyOptional({ enum: VariantStatus })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
