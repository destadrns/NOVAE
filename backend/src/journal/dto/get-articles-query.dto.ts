import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus, LanguageCode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetArticlesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by search term in title or category' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by editorial category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: LanguageCode, description: 'Preferred language code (default: id)' })
  @IsEnum(LanguageCode)
  @IsOptional()
  lang?: LanguageCode = LanguageCode.id;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 12 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 12;
}

export class AdminArticlesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by search term in title, slug, or category' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by content status', enum: ['draft', 'published', 'archived', 'ALL'] })
  @IsString()
  @IsOptional()
  status?: string = 'ALL';

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
