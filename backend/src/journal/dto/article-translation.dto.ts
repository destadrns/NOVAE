import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LanguageCode } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ArticleTranslationInputDto {
  @ApiProperty({ enum: LanguageCode, description: 'Translation language code', example: 'id' })
  @IsEnum(LanguageCode)
  @IsNotEmpty()
  language: LanguageCode;

  @ApiProperty({ description: 'Article title in target language', example: 'Anatomi dari Form' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Short summary or excerpt', example: 'Mengeksplorasi prinsip arsitektural...' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({ description: 'Complete article content/body text' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
