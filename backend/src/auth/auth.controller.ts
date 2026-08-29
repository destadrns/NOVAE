import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserProfileDto } from './dto/auth.dto';
import { User } from '@prisma/client';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({
    summary: 'Get current authenticated user profile & role',
    description:
      'Verifies Supabase JWT access token, resolves database profile from public.users, and returns user identity with server-authoritative role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile with role and preferences',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid Supabase access token',
  })
  async getMe(@CurrentUser() user: User & { preferences?: any }): Promise<UserProfileDto> {
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

  @Post('sync')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({
    summary: 'Synchronize Supabase user profile with application database',
    description: 'Ensures public.users and user_preferences are synchronized for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully synchronized',
    type: UserProfileDto,
  })
  async syncUser(@CurrentUser() user: User & { preferences?: any }): Promise<UserProfileDto> {
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
}
