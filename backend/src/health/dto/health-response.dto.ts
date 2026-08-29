import { ApiProperty } from '@nestjs/swagger';

export class DatabaseHealthDto {
  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiProperty({ example: 'postgresql' })
  database: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status: 'ok' | 'error';

  @ApiProperty({ example: '2026-08-29T16:30:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 42.15 })
  uptimeSeconds: number;

  @ApiProperty({ example: 'development' })
  environment: string;

  @ApiProperty({ type: () => DatabaseHealthDto })
  details: {
    database: DatabaseHealthDto;
  };
}
