import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

describe('NOVAÉ Authentication & Authorization (e2e)', () => {
  let app: INestApplication;
  const jwtSecret = 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';

  const mockAdminUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@novae.atelier',
    fullName: 'NOVAÉ Admin',
    role: UserRole.admin,
    status: UserStatus.active,
    avatarUrl: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    lastLoginAt: null,
    preferences: { language: 'id', marketingOptIn: false },
  };

  const mockCustomerUser = {
    id: '00000000-0000-0000-0001-000000000001',
    email: 'aria.wirasasmita@example.com',
    fullName: 'Aria Wirasasmita',
    role: UserRole.customer,
    status: UserStatus.active,
    avatarUrl: null,
    createdAt: new Date('2026-06-12T00:00:00Z'),
    updatedAt: new Date('2026-06-12T00:00:00Z'),
    lastLoginAt: null,
    preferences: { language: 'id', marketingOptIn: false },
  };

  const adminToken = jwt.sign(
    { sub: mockAdminUser.id, email: mockAdminUser.email },
    jwtSecret,
    { expiresIn: '1h' },
  );

  const customerToken = jwt.sign(
    { sub: mockCustomerUser.id, email: mockCustomerUser.email },
    jwtSecret,
    { expiresIn: '1h' },
  );

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    isHealthy: jest.fn().mockResolvedValue(true),
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockAdminUser.id || where.email === mockAdminUser.email) {
          return Promise.resolve(mockAdminUser);
        }
        if (where.id === mockCustomerUser.id || where.email === mockCustomerUser.email) {
          return Promise.resolve(mockCustomerUser);
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
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------------------------------------------------
  // AUTH GUARD VERIFICATION
  // ------------------------------------------------------------
  describe('GET /api/v1/auth/me (Authentication Guard)', () => {
    it('should reject with 401 when Authorization header is missing', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toContain('Missing Authorization header');
    });

    it('should reject with 401 when Bearer token is invalid/corrupted', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-corrupted-token-signature')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 200 OK and customer profile when valid customer token provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.id).toBe(mockCustomerUser.id);
      expect(res.body.email).toBe(mockCustomerUser.email);
      expect(res.body.role).toBe('customer');
      expect(res.body.fullName).toBe('Aria Wirasasmita');
    });

    it('should return 200 OK and admin profile when valid admin token provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(mockAdminUser.id);
      expect(res.body.email).toBe(mockAdminUser.email);
      expect(res.body.role).toBe('admin');
      expect(res.body.fullName).toBe('NOVAÉ Admin');
    });
  });

  // ------------------------------------------------------------
  // ROLES GUARD VERIFICATION
  // ------------------------------------------------------------
  describe('GET /api/v1/admin/* (Role Guard: Admin Only)', () => {
    it('should reject with 401 when no token is provided for admin route', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/me')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should reject with 403 Forbidden when a customer attempts to access admin route', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
      expect(res.body.error).toBe('Forbidden');
      expect(res.body.message).toContain("Forbidden: Role 'customer' is not authorized");
    });

    it('should allow access with 200 OK when an admin accesses /api/v1/admin/me', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(mockAdminUser.id);
      expect(res.body.role).toBe('admin');
    });

    it('should allow access with 200 OK when an admin accesses /api/v1/admin/overview', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.system).toBe('NOVAÉ Atelier Operations');
      expect(res.body.authenticatedRole).toBe('admin');
      expect(res.body.adminUserId).toBe(mockAdminUser.id);
    });
  });
});
