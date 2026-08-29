import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus, LanguageCode } from '@prisma/client';

export class UserPreferenceDto {
  @ApiProperty({ enum: LanguageCode, example: 'id' })
  language: LanguageCode;

  @ApiProperty({ example: false })
  marketingOptIn: boolean;
}

export class UserProfileDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001' })
  id: string;

  @ApiProperty({ example: 'admin@novae.atelier' })
  email: string;

  @ApiProperty({ example: 'NOVAÉ Admin' })
  fullName: string;

  @ApiProperty({ enum: UserRole, example: 'admin' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, example: 'active' })
  status: UserStatus;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ type: () => UserPreferenceDto })
  preferences?: UserPreferenceDto | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class AdminOverviewDto {
  @ApiProperty({ example: 'NOVAÉ Atelier Operations' })
  system: string;

  @ApiProperty({ example: 'admin' })
  authenticatedRole: string;

  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001' })
  adminUserId: string;

  @ApiProperty({ example: '2026-08-29T17:00:00.000Z' })
  serverTimestamp: string;
}
