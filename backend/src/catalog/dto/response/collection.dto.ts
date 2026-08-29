import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionDto {
  @ApiProperty({ example: '00000000-0000-0000-0003-000000000001' })
  id: string;

  @ApiProperty({ example: 'FORM' })
  code: string;

  @ApiProperty({ example: 'form' })
  slug: string;

  @ApiProperty({ example: 'FORM — Chapter 01' })
  name: string;

  @ApiPropertyOptional({ example: 'Explorasi siluet terstruktur dan geometri arsitektural.' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  coverImageUrl?: string | null;

  @ApiProperty({ example: 1 })
  sortOrder: number;
}
