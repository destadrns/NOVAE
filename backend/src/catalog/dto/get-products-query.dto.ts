import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { LanguageCode } from '@prisma/client';

export enum ProductSortOption {
  FEATURED = 'featured',
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

export class GetProductsQueryDto {
  @ApiPropertyOptional({
    enum: LanguageCode,
    default: LanguageCode.id,
    description: 'Language code for localized content',
  })
  @IsOptional()
  @IsEnum(LanguageCode)
  language?: LanguageCode = LanguageCode.id;

  @ApiPropertyOptional({
    example: 'outerwear',
    description: 'Filter by category slug',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'form',
    description: 'Filter by collection slug or collection code (e.g. form, FORM)',
  })
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiPropertyOptional({
    example: 'M',
    description: 'Filter by size (e.g. S, M, L, XL, 30, 32, ONE SIZE)',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    example: 'Obsidian Black',
    description: 'Filter by color name',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    example: 'Oversized,Tailored',
    description: 'Filter by product tags (comma-separated or single tag)',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Minimum base price in IDR',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 5000000,
    description: 'Maximum base price in IDR',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 'jacket',
    description: 'Free-text search across product name, description, and SKU',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ProductSortOption,
    default: ProductSortOption.FEATURED,
    description: 'Sorting criteria',
  })
  @IsOptional()
  @IsEnum(ProductSortOption)
  sort?: ProductSortOption = ProductSortOption.FEATURED;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Pagination page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 12,
    default: 12,
    description: 'Number of items per page (maximum 50)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;
}
