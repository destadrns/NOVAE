import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { LanguageCode } from '@prisma/client';

export class LanguageQueryDto {
  @ApiPropertyOptional({
    enum: LanguageCode,
    default: LanguageCode.id,
    description: 'Language code for localized content (id = Indonesian, en = English)',
  })
  @IsOptional()
  @IsEnum(LanguageCode)
  language?: LanguageCode = LanguageCode.id;

  @ApiPropertyOptional({
    enum: LanguageCode,
    description: 'Alias for language query param (lang=id | lang=en)',
  })
  @IsOptional()
  @IsEnum(LanguageCode)
  lang?: LanguageCode;
}
