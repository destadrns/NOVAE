import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductColorDto {
  @ApiProperty({ example: 'Obsidian Black' })
  name: string;

  @ApiPropertyOptional({ example: '#0B0C0E' })
  code?: string | null;
}

export class ProductListItemDto {
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

  @ApiProperty({ example: 1850000 })
  basePriceIdr: number;

  @ApiProperty({ example: 'outerwear' })
  categorySlug: string;

  @ApiProperty({ example: 'Outerwear' })
  categoryName: string;

  @ApiPropertyOptional({ example: 'form' })
  collectionSlug?: string | null;

  @ApiPropertyOptional({ example: 'FORM — Chapter 01' })
  collectionName?: string | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544441893-675973e31985' })
  primaryImageUrl?: string | null;

  @ApiProperty({ example: true })
  featured: boolean;

  @ApiProperty({ example: true })
  isNewDrop: boolean;

  @ApiProperty({ example: false })
  limitedRun: boolean;

  @ApiProperty({ type: [ProductColorDto] })
  colors: ProductColorDto[];

  @ApiProperty({ example: ['S', 'M', 'L', 'XL'] })
  sizes: string[];

  @ApiProperty({ example: ['Oversized', 'Denim'] })
  tags: string[];

  @ApiProperty({ example: true })
  inStock: boolean;
}
