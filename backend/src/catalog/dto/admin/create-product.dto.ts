import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { LanguageCode, ProductStatus, VariantStatus } from '@prisma/client';

export class ProductTranslationInputDto {
  @ApiProperty({ enum: LanguageCode, example: LanguageCode.id })
  @IsEnum(LanguageCode)
  language: LanguageCode;

  @ApiProperty({ example: 'Oversized Form Jacket' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Jaket struktural bervolume lebar.' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Eksplorasi siluet arsitektural yang menggabungkan presisi bespoke.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '14oz Kurabo Japanese Selvedge Raw Denim.' })
  @IsOptional()
  @IsString()
  materialDescription?: string;

  @ApiPropertyOptional({ example: 'Dibuat di atelier Bandung.' })
  @IsOptional()
  @IsString()
  provenanceText?: string;
}

export class ProductImageInputDto {
  @ApiProperty({ example: 'https://images.unsplash.com/photo-1544441893-675973e31985' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ example: 'Front Atelier Shot' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}

export class ProductVariantInputDto {
  @ApiProperty({ example: 'NV-JKT-001-RAW-S' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Raw Indigo' })
  @IsString()
  @IsNotEmpty()
  colorName: string;

  @ApiPropertyOptional({ example: '#1C2333' })
  @IsOptional()
  @IsString()
  colorCode?: string;

  @ApiProperty({ example: 'S' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiPropertyOptional({ example: 1850000 })
  @IsOptional()
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

  @ApiPropertyOptional({ example: 5, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialStock?: number = 0;
}

export class CreateProductDto {
  @ApiProperty({ example: 'NV-JKT-001' })
  @IsString()
  @IsNotEmpty()
  skuRoot: string;

  @ApiProperty({ example: 'oversized-form-jacket' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: '00000000-0000-0000-0002-000000000001' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: '00000000-0000-0000-0003-000000000001' })
  @IsOptional()
  @IsString()
  collectionId?: string;

  @ApiProperty({ example: 1850000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePriceIdr: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.draft })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.draft;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean = false;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isNewDrop?: boolean = false;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  limitedRun?: boolean = false;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  featuredRank?: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544441893-675973e31985' })
  @IsOptional()
  @IsString()
  primaryImageUrl?: string;

  @ApiProperty({ type: [ProductTranslationInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationInputDto)
  translations: ProductTranslationInputDto[];

  @ApiPropertyOptional({ example: ['Oversized', 'Raw Denim'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @ApiPropertyOptional({ type: [ProductImageInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  images?: ProductImageInputDto[] = [];

  @ApiPropertyOptional({ type: [ProductVariantInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantInputDto)
  variants?: ProductVariantInputDto[] = [];
}
