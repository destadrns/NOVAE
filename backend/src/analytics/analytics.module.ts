import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsService } from './analytics.service';
import { AdminAnalyticsController } from './admin-analytics.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminAnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
