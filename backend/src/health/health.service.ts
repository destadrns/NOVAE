import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async check(): Promise<HealthResponseDto> {
    const isDbHealthy = await this.prisma.isHealthy();
    const env = this.config.get<string>('nodeEnv') || 'development';

    return {
      status: isDbHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime() * 100) / 100,
      environment: env,
      details: {
        database: {
          status: isDbHealthy ? 'up' : 'down',
          database: 'postgresql',
        },
      },
    };
  }
}
