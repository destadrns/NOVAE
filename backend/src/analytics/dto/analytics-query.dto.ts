import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Time window preset',
    enum: ['7d', '30d', '90d', 'all'],
    default: '30d',
  })
  @IsOptional()
  @IsIn(['7d', '30d', '90d', 'all'])
  range?: '7d' | '30d' | '90d' | 'all' = '30d';

  @ApiPropertyOptional({ description: 'Custom start date (ISO 8601)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Custom end date (ISO 8601)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Language code for product and collection names', enum: ['id', 'en'], default: 'id' })
  @IsOptional()
  @IsIn(['id', 'en'])
  lang?: 'id' | 'en' = 'id';
}
