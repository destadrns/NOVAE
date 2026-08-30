import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus, LanguageCode } from '@prisma/client';

export class LocalizedArticleTranslationDto {
  @ApiProperty({ enum: LanguageCode, description: 'Language code' })
  language: LanguageCode;

  @ApiProperty({ description: 'Article title' })
  title: string;

  @ApiPropertyOptional({ description: 'Article excerpt' })
  excerpt?: string | null;

  @ApiProperty({ description: 'Article body content' })
  content: string;
}

export class ArticleListItemDto {
  @ApiProperty({ description: 'Article UUID' })
  id: string;

  @ApiProperty({ description: 'Article URL slug', example: 'anatomy-of-form' })
  slug: string;

  @ApiProperty({ description: 'Editorial category', example: 'Design Philosophy' })
  category: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  coverImageUrl?: string | null;

  @ApiProperty({ description: 'Author attribution name', example: 'NOVAÉ Atelier Editorial' })
  author: string;

  @ApiProperty({ description: 'Estimated reading time in minutes', example: 5 })
  readingTimeMinutes: number;

  @ApiProperty({ enum: ContentStatus, description: 'Content publication status' })
  status: ContentStatus;

  @ApiProperty({ description: 'Whether the article is featured' })
  featured: boolean;

  @ApiProperty({ description: 'Resolved article title in requested language' })
  title: string;

  @ApiPropertyOptional({ description: 'Resolved excerpt in requested language' })
  excerpt?: string | null;

  @ApiPropertyOptional({ description: 'Publication timestamp' })
  publishedAt?: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class ArticleDetailDto extends ArticleListItemDto {
  @ApiProperty({ description: 'Full article body content in requested language' })
  content: string;
}

export class AdminArticleDetailDto extends ArticleListItemDto {
  @ApiProperty({ description: 'Raw translations across all languages', type: [LocalizedArticleTranslationDto] })
  translations: LocalizedArticleTranslationDto[];

  @ApiProperty({ description: 'Author user ID if linked' })
  authorUserId?: string | null;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PaginatedArticlesDto {
  @ApiProperty({ type: [ArticleListItemDto], description: 'List of articles' })
  data: ArticleListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: { page: 1, limit: 12, totalItems: 3, totalPages: 1 },
  })
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
