import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductColorDto } from './product-list-item.dto';

export class ProductImageDto {
  @ApiProperty({ example: '00000000-0000-0000-0007-000000000001' })
  id: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1544441893-675973e31985' })
  imageUrl: string;

  @ApiPropertyOptional({ example: 'Oversized Form Jacket — Front Atelier Shot' })
  altText?: string | null;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isPrimary: boolean;

  @ApiPropertyOptional({ example: '00000000-0000-0000-0006-000000000001' })
  variantId?: string | null;
}

export class ProductVariantDto {
  @ApiProperty({ example: '00000000-0000-0000-0006-000000000001' })
  id: string;

  @ApiProperty({ example: 'NV-JKT-001-RAW-S' })
  sku: string;

  @ApiProperty({ example: 'Raw Indigo' })
  colorName: string;

  @ApiPropertyOptional({ example: '#1C2333' })
  colorCode?: string | null;

  @ApiProperty({ example: 'S' })
  size: string;

  @ApiProperty({ example: 1850000 })
  priceIdr: number;

  @ApiProperty({ example: true })
  inStock: boolean;

  @ApiProperty({ example: 6 })
  availableQuantity: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  imageUrl?: string | null;
}

export class ProductDetailCategoryDto {
  @ApiProperty({ example: '00000000-0000-0000-0002-000000000001' })
  id: string;

  @ApiProperty({ example: 'outerwear' })
  slug: string;

  @ApiProperty({ example: 'Outerwear' })
  name: string;
}

export class ProductDetailCollectionDto {
  @ApiProperty({ example: '00000000-0000-0000-0003-000000000001' })
  id: string;

  @ApiProperty({ example: 'FORM' })
  code: string;

  @ApiProperty({ example: 'form' })
  slug: string;

  @ApiProperty({ example: 'FORM — Chapter 01' })
  name: string;
}

export class ProductDetailDto {
  @ApiProperty({ example: '00000000-0000-0000-0005-000000000001' })
  id: string;

  @ApiProperty({ example: 'NV-JKT-001' })
  skuRoot: string;

  @ApiProperty({ example: 'oversized-form-jacket' })
  slug: string;

  @ApiProperty({ example: 'Oversized Form Jacket' })
  name: string;

  @ApiPropertyOptional({ example: 'Jaket struktural bervolume lebar dengan bahan Japanese Raw Denim.' })
  shortDescription?: string | null;

  @ApiPropertyOptional({ example: 'Eksplorasi siluet arsitektural yang menggabungkan presisi tailoring bespoke.' })
  description?: string | null;

  @ApiPropertyOptional({ example: '14oz Kurabo Japanese Selvedge Raw Denim, 100% Organic Cotton.' })
  materialDescription?: string | null;

  @ApiPropertyOptional({ example: 'Dibuat secara terbatas di atelier Bandung.' })
  provenanceText?: string | null;

  @ApiProperty({ example: 1850000 })
  basePriceIdr: number;

  @ApiProperty({ type: ProductDetailCategoryDto })
  category: ProductDetailCategoryDto;

  @ApiPropertyOptional({ type: ProductDetailCollectionDto })
  collection?: ProductDetailCollectionDto | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544441893-675973e31985' })
  primaryImageUrl?: string | null;

  @ApiProperty({ example: true })
  featured: boolean;

  @ApiProperty({ example: true })
  isNewDrop: boolean;

  @ApiProperty({ example: false })
  limitedRun: boolean;

  @ApiProperty({ example: true })
  isPurchasable: boolean;

  @ApiProperty({ type: [ProductColorDto] })
  colors: ProductColorDto[];

  @ApiProperty({ example: ['S', 'M', 'L', 'XL'] })
  sizes: string[];

  @ApiProperty({ example: ['Oversized', 'Denim'] })
  tags: string[];

  @ApiProperty({ type: [ProductImageDto] })
  images: ProductImageDto[];

  @ApiProperty({ type: [ProductVariantDto] })
  variants: ProductVariantDto[];
}
