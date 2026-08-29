import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { ProductTranslationInputDto, ProductImageInputDto } from './create-product.dto';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'NV-JKT-001' })
  @IsOptional()
  @IsString()
  skuRoot?: string;

  @ApiPropertyOptional({ example: 'oversized-form-jacket' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: '00000000-0000-0000-0002-000000000001' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: '00000000-0000-0000-0003-000000000001' })
  @IsOptional()
  @IsString()
  collectionId?: string | null;

  @ApiPropertyOptional({ example: 1850000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePriceIdr?: number;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isNewDrop?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  limitedRun?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  featuredRank?: number | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544441893-675973e31985' })
  @IsOptional()
  @IsString()
  primaryImageUrl?: string | null;

  @ApiPropertyOptional({ type: [ProductTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationInputDto)
  translations?: ProductTranslationInputDto[];

  @ApiPropertyOptional({ example: ['Oversized', 'Raw Denim'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [ProductImageInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  images?: ProductImageInputDto[];
}
