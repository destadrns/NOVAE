import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  const mockJwtSecret = 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';

  const mockAdminDbUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@novae.atelier',
    fullName: 'NOVAÉ Admin',
    role: UserRole.admin,
    status: UserStatus.active,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    preferences: { language: 'id', marketingOptIn: false },
  };

  const mockCustomerDbUser = {
    id: '00000000-0000-0000-0001-000000000001',
    email: 'aria.wirasasmita@example.com',
    fullName: 'Aria Wirasasmita',
    role: UserRole.customer,
    status: UserStatus.active,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    preferences: { language: 'id', marketingOptIn: false },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === mockAdminDbUser.id || where.email === mockAdminDbUser.email) {
                  return Promise.resolve(mockAdminDbUser);
                }
                if (where.id === mockCustomerDbUser.id || where.email === mockCustomerDbUser.email) {
                  return Promise.resolve(mockCustomerDbUser);
                }
                return Promise.resolve(null);
              }),
              create: jest.fn().mockImplementation(({ data }) => {
                return Promise.resolve({
                  id: data.id,
                  email: data.email,
                  fullName: data.fullName,
                  role: data.role || UserRole.customer,
                  status: data.status || UserStatus.active,
                  avatarUrl: null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  lastLoginAt: null,
                  preferences: { language: 'id', marketingOptIn: false },
                });
              }),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'supabase.jwtSecret') return mockJwtSecret;
              if (key === 'supabase.url') return '';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should verify a valid signed JWT and return decoded user', async () => {
    const token = jwt.sign(
      { sub: mockCustomerDbUser.id, email: mockCustomerDbUser.email },
      mockJwtSecret,
      { expiresIn: '1h' },
    );

    const decoded = await service.verifyToken(token);
    expect(decoded.id).toBe(mockCustomerDbUser.id);
    expect(decoded.email).toBe(mockCustomerDbUser.email);
  });

  it('should throw UnauthorizedException on missing token', async () => {
    await expect(service.verifyToken('')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException on corrupted token signature', async () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted.payload';
    await expect(service.verifyToken(invalidToken)).rejects.toThrow(UnauthorizedException);
  });

  it('should resolve existing database user with role', async () => {
    const user = await service.getOrCreateUser({
      id: mockAdminDbUser.id,
      email: mockAdminDbUser.email,
    });

    expect(user.role).toBe(UserRole.admin);
    expect(user.email).toBe('admin@novae.atelier');
  });

  it('should auto-provision a new customer profile if missing in database', async () => {
    const newUserId = '00000000-0000-0000-0099-000000000099';
    const newUserEmail = 'brand.new.user@example.com';

    const user = await service.getOrCreateUser({
      id: newUserId,
      email: newUserEmail,
      user_metadata: { full_name: 'New Fashion Lover' },
    });

    expect(user.id).toBe(newUserId);
    expect(user.email).toBe(newUserEmail);
    expect(user.role).toBe(UserRole.customer);
    expect(prismaService.user.create).toHaveBeenCalled();
  });
});
