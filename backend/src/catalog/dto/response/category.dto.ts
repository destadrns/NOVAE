import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({ example: '00000000-0000-0000-0002-000000000001' })
  id: string;

  @ApiProperty({ example: 'outerwear' })
  slug: string;

  @ApiProperty({ example: 'Outerwear' })
  name: string;

  @ApiPropertyOptional({ example: 'Architectural jackets, trench coats, and structured outerwear.' })
  description?: string | null;

  @ApiProperty({ example: 1 })
  sortOrder: number;
}
