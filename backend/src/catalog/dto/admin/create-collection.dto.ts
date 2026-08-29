import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ContentStatus, LanguageCode } from '@prisma/client';

export class CollectionTranslationInputDto {
  @ApiProperty({ enum: LanguageCode, example: LanguageCode.id })
  @IsEnum(LanguageCode)
  language: LanguageCode;

  @ApiProperty({ example: 'FORM — Chapter 01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Explorasi siluet terstruktur dan geometri arsitektural.' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCollectionDto {
  @ApiProperty({ example: 'FORM' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'form' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'FORM — Chapter 01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Explorasi siluet terstruktur dan geometri arsitektural.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.draft })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus = ContentStatus.draft;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;

  @ApiPropertyOptional({ type: [CollectionTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionTranslationInputDto)
  translations?: CollectionTranslationInputDto[] = [];
}

export class UpdateCollectionDto {
  @ApiPropertyOptional({ example: 'FORM' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'form' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'FORM — Chapter 01' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Explorasi siluet terstruktur.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ type: [CollectionTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionTranslationInputDto)
  translations?: CollectionTranslationInputDto[];
}
