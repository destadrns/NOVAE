import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminAuthController } from './admin-auth.controller';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [AuthController, AdminAuthController],
  providers: [AuthService, SupabaseAuthGuard, OptionalAuthGuard, RolesGuard],
  exports: [AuthService, SupabaseAuthGuard, OptionalAuthGuard, RolesGuard],
})
export class AuthModule {}
