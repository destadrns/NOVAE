import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { AdminJournalController } from './admin-journal.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JournalController, AdminJournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
