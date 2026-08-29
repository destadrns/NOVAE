import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';
import {
  InventoryMovementType,
  LanguageCode,
  ProductStatus,
  UserRole,
  UserStatus,
  VariantStatus,
} from '@prisma/client';

describe('NOVAÉ Admin Inventory (e2e)', () => {
  let app: INestApplication;
  const jwtSecret = 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';

  const mockAdminUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@novae.atelier',
    fullName: 'Madame Direktris',
    role: UserRole.admin,
    status: UserStatus.active,
  };

  const mockCustomerUser = {
    id: '00000000-0000-0000-0001-000000000001',
    email: 'aria.wirasasmita@client.novae.atelier',
    fullName: 'Aria Wirasasmita',
    role: UserRole.customer,
    status: UserStatus.active,
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

  const mockProduct = {
    id: '00000000-0000-0000-0005-000000000001',
    skuRoot: 'NV-JKT-001',
    slug: 'oversized-form-jacket',
    basePriceIdr: BigInt(1850000),
    status: ProductStatus.active,
    translations: [
      {
        language: LanguageCode.id,
        name: 'Oversized Form Jacket (ID)',
      },
    ],
    category: {
      id: '00000000-0000-0000-0002-000000000001',
      slug: 'outerwear',
      name: 'Outerwear',
    },
    collection: {
      id: '00000000-0000-0000-0003-000000000001',
      code: 'FORM',
      slug: 'form',
      name: 'FORM — Chapter 01',
    },
  };

  const mockVariant = {
    id: '00000000-0000-0000-0006-000000000001',
    productId: mockProduct.id,
    sku: 'NV-JKT-001-RAW-S',
    colorName: 'Raw Indigo',
    colorCode: '#1C2333',
    size: 'S',
    priceOverrideIdr: null,
    status: VariantStatus.active,
    product: mockProduct,
  };

  const mockInventory = {
    id: '00000000-0000-0000-0007-000000000001',
    variantId: mockVariant.id,
    quantityOnHand: 10,
    reservedQuantity: 2,
    lowStockThreshold: 3,
    updatedAt: new Date('2026-08-30T00:00:00Z'),
    variant: mockVariant,
  };

  const mockMovement = {
    id: '00000000-0000-0000-0008-000000000001',
    variantId: mockVariant.id,
    movementType: InventoryMovementType.restock,
    quantityDelta: 10,
    referenceType: 'manual_adjustment',
    referenceId: null,
    note: 'Initial seasonal batch',
    createdBy: mockAdminUser.id,
    createdAt: new Date('2026-08-30T00:00:00Z'),
    user: mockAdminUser,
  };

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    isHealthy: jest.fn().mockResolvedValue(true),
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockAdminUser.id) return Promise.resolve(mockAdminUser);
        if (where.id === mockCustomerUser.id) return Promise.resolve(mockCustomerUser);
        return Promise.resolve(null);
      }),
    },
    inventory: {
      findMany: jest.fn().mockResolvedValue([mockInventory]),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.variantId === mockVariant.id) return Promise.resolve(mockInventory);
        return Promise.resolve(null);
      }),
      create: jest.fn().mockResolvedValue(mockInventory),
      update: jest.fn().mockResolvedValue(mockInventory),
    },
    productVariant: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockVariant.id) {
          return Promise.resolve({ ...mockVariant, inventory: mockInventory });
        }
        return Promise.resolve(null);
      }),
    },
    inventoryMovement: {
      findMany: jest.fn().mockResolvedValue([mockMovement]),
      create: jest.fn().mockResolvedValue(mockMovement),
    },
    $transaction: jest.fn().mockImplementation((cb) =>
      cb({
        productVariant: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockVariant,
            inventory: mockInventory,
          }),
        },
        inventory: {
          update: jest.fn().mockImplementation(({ data }) =>
            Promise.resolve({
              ...mockInventory,
              quantityOnHand: data.quantityOnHand,
              lowStockThreshold:
                data.lowStockThreshold !== undefined
                  ? data.lowStockThreshold
                  : mockInventory.lowStockThreshold,
            }),
          ),
        },
        inventoryMovement: {
          create: jest.fn().mockResolvedValue(mockMovement),
        },
      }),
    ),
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
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authorization Checks (/api/v1/admin/inventory/*)', () => {
    it('should return 401 Unauthorized for unauthenticated request', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/inventory')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should return 403 Forbidden for customer role', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/inventory')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });

    it('should allow admin role to access GET /api/v1/admin/inventory', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('summary');
      expect(res.body.data[0].sku).toBe('NV-JKT-001-RAW-S');
      expect(res.body.summary.totalPieces).toBe(10);
    });
  });

  describe('Inventory Query & Low-Stock Operations', () => {
    it('GET /api/v1/admin/inventory/low-stock should return low stock variants', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/inventory/low-stock')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/v1/admin/inventory/:variantId should return variant inventory detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/inventory/${mockVariant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.variantId).toBe(mockVariant.id);
      expect(res.body.quantityOnHand).toBe(10);
      expect(res.body.availableQuantity).toBe(8);
      expect(res.body.status).toBe('IN_STOCK');
    });
  });

  describe('Stock Adjustment Operations (PATCH /api/v1/admin/inventory/:variantId)', () => {
    it('should successfully increase stock on restock', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/inventory/${mockVariant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantityDelta: 5,
          movementType: InventoryMovementType.restock,
          note: 'Seasonal batch',
        })
        .expect(200);

      expect(res.body.quantityOnHand).toBe(15);
      expect(res.body.availableQuantity).toBe(13); // 15 - 2
    });

    it('should successfully decrease stock on adjustment', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/inventory/${mockVariant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantityDelta: -2,
          movementType: InventoryMovementType.adjustment,
        })
        .expect(200);

      expect(res.body.quantityOnHand).toBe(8);
    });

    it('should reject adjustment with quantityDelta = 0 with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/inventory/${mockVariant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantityDelta: 0,
        })
        .expect(400);

      expect(res.body.message).toContain('quantityDelta must not be 0');
    });
  });

  describe('Inventory Movement History (GET /api/v1/admin/inventory/:variantId/movements)', () => {
    it('should return chronological movement records with audit information', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/inventory/${mockVariant.id}/movements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].movementType).toBe(InventoryMovementType.restock);
      expect(res.body[0].quantityDelta).toBe(10);
      expect(res.body[0].createdByName).toBe('Madame Direktris');
    });
  });
});
