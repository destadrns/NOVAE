import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ArticleTranslationInputDto } from './article-translation.dto';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Unique URL slug for the article',
    example: 'anatomy-of-form',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lower-case alphanumeric with single hyphens (e.g. anatomy-of-form)',
  })
  slug: string;

  @ApiProperty({
    description: 'Editorial category',
    example: 'Design Philosophy',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category: string;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e',
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Estimated reading time in minutes',
    example: 5,
    default: 5,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readingTimeMinutes?: number = 5;

  @ApiPropertyOptional({
    enum: ContentStatus,
    description: 'Publication state',
    example: 'draft',
    default: 'draft',
  })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus = ContentStatus.draft;

  @ApiPropertyOptional({
    description: 'Whether this article is pinned as a featured lead story',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  featured?: boolean = false;

  @ApiPropertyOptional({
    description: 'Author user ID if linked to a registered user profile',
    example: '00000000-0000-0000-0000-000000000001',
  })
  @IsString()
  @IsOptional()
  authorUserId?: string;

  @ApiPropertyOptional({
    description: 'Publication date override',
    example: '2026-08-30T10:00:00Z',
  })
  @IsOptional()
  publishedAt?: Date;

  @ApiProperty({
    description: 'Bilingual translation array (at least 1 translation required)',
    type: [ArticleTranslationInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleTranslationInputDto)
  translations: ArticleTranslationInputDto[];
}
