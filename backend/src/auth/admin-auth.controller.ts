import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';
import { UserProfileDto, AdminOverviewDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Admin Operations (Protected)')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Get('customers')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'List all registered customer accounts with order counts and spend',
  })
  async getCustomers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.authService.getAdminCustomers({
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Delete('customers/:id')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Delete customer profile and associated carts/wishlists',
  })
  @ApiParam({ name: 'id', description: 'Customer User UUID' })
  async deleteCustomer(@Param('id') id: string) {
    return this.authService.deleteCustomer(id);
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
