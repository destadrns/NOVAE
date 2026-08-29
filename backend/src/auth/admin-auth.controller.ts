import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';
import { UserProfileDto, AdminOverviewDto } from './dto/auth.dto';

@ApiTags('Admin Operations (Protected)')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AdminAuthController {
  @Get('me')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Verify admin identity and privileges',
    description: 'Requires a valid Supabase access token for a user with public.users.role = "admin".',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin identity confirmed',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User is not an admin',
  })
  async getAdminMe(@CurrentUser() user: User & { preferences?: any }): Promise<UserProfileDto> {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };
  }

  @Get('overview')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Admin overview telemetry check',
    description: 'Protected route accessible only by verified administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin overview telemetry',
    type: AdminOverviewDto,
  })
  async getAdminOverview(@CurrentUser() user: User): Promise<AdminOverviewDto> {
    return {
      system: 'NOVAÉ Atelier Operations',
      authenticatedRole: user.role,
      adminUserId: user.id,
      serverTimestamp: new Date().toISOString(),
    };
  }
}
