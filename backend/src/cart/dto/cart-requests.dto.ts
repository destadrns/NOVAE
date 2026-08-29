import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({
    example: '00000000-0000-0000-0006-000000000001',
    description: 'Product variant UUID to add to cart',
  })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Number of units to add',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}

export class UpdateCartItemDto {
  @ApiProperty({
    example: 2,
    minimum: 0,
    description: 'New quantity for this cart item (0 to remove)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity: number;
}

export class MergeCartDto {
  @ApiProperty({
    example: 'guest-session-uuid-12345',
    description: 'Guest session key from localStorage to merge into authenticated user cart',
  })
  @IsNotEmpty()
  guestSessionKey: string;
}
