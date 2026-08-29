import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({
    example: '00000000-0000-0000-0005-000000000001',
    description: 'Product UUID to add to user wishlist',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class WishlistItemDto {
  @ApiProperty({ example: '00000000-0000-0000-0009-000000000001' })
  id: string;

  @ApiProperty({ example: '00000000-0000-0000-0005-000000000001' })
  productId: string;

  @ApiProperty({ example: 'oversized-form-jacket' })
  slug: string;

  @ApiProperty({ example: 'Oversized Form Jacket' })
  name: string;

  @ApiProperty({ example: 'NV-JKT-001' })
  skuRoot: string;

  @ApiProperty({ example: 1850000 })
  basePriceIdr: number;

  @ApiProperty({ example: 'https://images.unsplash.com/...' })
  imageUrl?: string | null;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiProperty({ example: 'Outerwear' })
  categoryName?: string | null;

  @ApiProperty({ example: 'FORM' })
  collectionCode?: string | null;

  @ApiProperty({ example: '2026-08-30T00:00:00.000Z' })
  createdAt: Date;
}

export class WishlistResponseDto {
  @ApiProperty({ example: '00000000-0000-0000-0008-000000000001' })
  id: string;

  @ApiProperty({ example: '00000000-0000-0000-0001-000000000001' })
  userId: string;

  @ApiProperty({ example: 3 })
  itemCount: number;

  @ApiProperty({ type: [WishlistItemDto] })
  items: WishlistItemDto[];
}
