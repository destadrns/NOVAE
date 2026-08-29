import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryStatusFilter {
  ALL = 'ALL',
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export class AdminInventoryQueryDto {
  @ApiPropertyOptional({ description: 'Search term for product name, SKU, or color' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: InventoryStatusFilter, default: InventoryStatusFilter.ALL })
  @IsOptional()
  @IsEnum(InventoryStatusFilter)
  status?: InventoryStatusFilter = InventoryStatusFilter.ALL;

  @ApiPropertyOptional({ description: 'Filter by category ID or slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by collection ID or slug' })
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
