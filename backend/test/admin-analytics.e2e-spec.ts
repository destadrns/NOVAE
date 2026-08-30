import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

describe('NOVAÉ Admin Analytics (e2e)', () => {
  let app: INestApplication;
  const jwtSecret = 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';

  const mockAdmin = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@novae.atelier',
    fullName: 'Admin Atelier',
    role: UserRole.admin,
    status: UserStatus.active,
  };

  const mockCustomer = {
    id: '00000000-0000-0000-0001-000000000001',
    email: 'aria@client.novae.atelier',
    fullName: 'Aria Wirasasmita',
    role: UserRole.customer,
    status: UserStatus.active,
  };

  const adminToken = jwt.sign(
    { sub: mockAdmin.id, email: mockAdmin.email },
    jwtSecret,
    { expiresIn: '1h' },
  );

  const customerToken = jwt.sign(
    { sub: mockCustomer.id, email: mockCustomer.email },
    jwtSecret,
    { expiresIn: '1h' },
  );

  const mockPrisma = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockAdmin.id || where.email === mockAdmin.email) {
          return Promise.resolve(mockAdmin);
        }
        if (where.id === mockCustomer.id || where.email === mockCustomer.email) {
          return Promise.resolve(mockCustomer);
        }
        return Promise.resolve(null);
      }),
      count: jest.fn().mockResolvedValue(6),
    },
    order: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'ord-1',
          orderNumber: 'NOV-2026-0104',
          customerEmail: 'alex.tan@fashion.sg',
          status: 'delivered',
          totalIdr: 1548000n,
          createdAt: new Date('2026-08-25T10:00:00Z'),
          shippingAddressSnapshot: { recipientName: 'Alex Tan', city: 'Jakarta Selatan' },
          items: [{ productId: 'prod-1', quantity: 1, lineTotalIdr: 899000n }],
        },
      ]),
      groupBy: jest.fn().mockResolvedValue([
        { status: 'delivered', _count: { id: 1 } },
      ]),
      count: jest.fn().mockResolvedValue(1),
    },
    orderItem: {
      groupBy: jest.fn().mockResolvedValue([
        { productId: 'prod-1', _sum: { quantity: 1, lineTotalIdr: 899000n } },
      ]),
    },
    inventory: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'inv-1',
          quantityOnHand: 4,
          reservedQuantity: 1,
          lowStockThreshold: 3,
          variant: {
            id: 'var-1',
            sku: 'NOV-FRM-01-BLK-S',
            colorName: 'Obsidian Black',
            size: 'S',
            product: {
              id: 'prod-1',
              slug: 'oversized-form-jacket',
              translations: [{ language: 'id', name: 'Oversized Form Jacket' }],
            },
          },
        },
      ]),
      aggregate: jest.fn().mockResolvedValue({
        _sum: { quantityOnHand: 99, reservedQuantity: 5 },
      }),
    },
    cart: {
      count: jest.fn().mockResolvedValue(4),
    },
    wishlistItem: {
      count: jest.fn().mockResolvedValue(8),
    },
    collection: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'col-1',
          code: 'FORM',
          name: 'FORM',
          description: 'Architectural Heavyweight',
          translations: [{ language: 'id', name: 'FORM' }],
          products: [{ id: 'prod-1', variants: [] }],
        },
      ]),
    },
    product: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'prod-1',
          slug: 'oversized-form-jacket',
          skuRoot: 'NOV-FRM-01',
          category: { name: 'Outerwear' },
          translations: [{ language: 'id', name: 'Oversized Form Jacket' }],
        },
      ]),
    },
    styleProfile: {
      count: jest.fn().mockResolvedValue(5),
      groupBy: jest.fn().mockResolvedValue([
        { archetypeCode: 'ARCHITECTURAL_MINIMALIST', _count: { id: 3 } },
      ]),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/admin/analytics/overview', () => {
    it('should reject unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/analytics/overview')
        .expect(401);
    });

    it('should reject customer role with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/analytics/overview')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should return full analytics overview for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/analytics/overview?range=30d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('metrics');
      expect(res.body.metrics).toHaveProperty('grossSales');
      expect(res.body.metrics).toHaveProperty('totalOrders');
      expect(res.body.metrics).toHaveProperty('totalPiecesInStock');
      expect(res.body).toHaveProperty('salesTrend');
      expect(res.body).toHaveProperty('capsuleDistribution');
      expect(res.body).toHaveProperty('orderStatusDistribution');
      expect(res.body).toHaveProperty('recentOrders');
      expect(res.body).toHaveProperty('customerActivity');
      expect(res.body).toHaveProperty('styleFinder');
    });
  });

  describe('GET /api/v1/admin/analytics/revenue', () => {
    it('should return revenue breakdown for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/analytics/revenue')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('metrics');
      expect(res.body).toHaveProperty('salesTrend');
      expect(res.body).toHaveProperty('capsuleDistribution');
    });
  });

  describe('GET /api/v1/admin/analytics/inventory', () => {
    it('should return inventory analytics for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/analytics/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalPiecesInStock');
      expect(res.body).toHaveProperty('lowStockAlerts');
    });
  });

  describe('GET /api/v1/admin/analytics/orders', () => {
    it('should return order analytics for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/analytics/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalOrders');
      expect(res.body).toHaveProperty('orderStatusDistribution');
      expect(res.body).toHaveProperty('recentOrders');
    });
  });

  describe('GET /api/v1/admin/analytics/style-finder', () => {
    it('should return style finder analytics for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/analytics/style-finder')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalProfiles');
      expect(res.body).toHaveProperty('archetypeDistribution');
    });
  });
});
