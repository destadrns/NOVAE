import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';
import { LanguageCode, ProductStatus, UserRole, UserStatus, VariantStatus } from '@prisma/client';

describe('NOVAÉ Admin Catalog (e2e)', () => {
  let app: INestApplication;
  const jwtSecret = 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';

  const mockAdminUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@novae.atelier',
    fullName: 'Madame Direktris',
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
    email: 'aria.wirasasmita@client.novae.atelier',
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

  const mockProduct = {
    id: '00000000-0000-0000-0005-000000000001',
    skuRoot: 'NV-JKT-001',
    slug: 'oversized-form-jacket',
    categoryId: '00000000-0000-0000-0002-000000000001',
    collectionId: null,
    basePriceIdr: BigInt(1850000),
    status: ProductStatus.draft,
    featured: true,
    isNewDrop: true,
    limitedRun: false,
    featuredRank: 1,
    primaryImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: '00000000-0000-0000-0002-000000000001', slug: 'outerwear', name: 'Outerwear' },
    collection: null,
    translations: [
      {
        id: 'pt-01',
        productId: '00000000-0000-0000-0005-000000000001',
        language: LanguageCode.id,
        name: 'Oversized Form Jacket (ID)',
        shortDescription: 'Jaket struktural bervolume lebar.',
        description: 'Deskripsi lengkap.',
        materialDescription: '14oz Kurabo Raw Denim.',
        provenanceText: 'Bandung atelier.',
      },
    ],
    variants: [
      {
        id: '00000000-0000-0000-0006-000000000001',
        productId: '00000000-0000-0000-0005-000000000001',
        sku: 'NV-JKT-001-RAW-S',
        colorName: 'Raw Indigo',
        colorCode: '#1C2333',
        size: 'S',
        priceOverrideIdr: null,
        status: VariantStatus.active,
        imageUrl: null,
        inventory: { quantityOnHand: 6, reservedQuantity: 0 },
      },
    ],
    images: [],
    tagMaps: [],
  };

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    isHealthy: jest.fn().mockResolvedValue(true),
    $transaction: jest.fn().mockImplementation((cb) =>
      cb({
        product: {
          create: jest.fn().mockResolvedValue(mockProduct),
          update: jest.fn().mockResolvedValue({ ...mockProduct, status: ProductStatus.archived }),
        },
        productTranslation: {
          upsert: jest.fn().mockResolvedValue({}),
        },
        productTag: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'tag-01', name: 'Oversized' }),
        },
        productTagMap: {
          create: jest.fn().mockResolvedValue({}),
          deleteMany: jest.fn().mockResolvedValue({}),
        },
        productImage: {
          create: jest.fn().mockResolvedValue({}),
        },
        productVariant: {
          create: jest.fn().mockResolvedValue(mockProduct.variants[0]),
          update: jest.fn().mockResolvedValue(mockProduct.variants[0]),
        },
        inventory: {
          create: jest.fn().mockResolvedValue({}),
        },
        collection: {
          create: jest.fn().mockResolvedValue({ id: 'col-01', code: 'FORM', slug: 'form', name: 'FORM' }),
          update: jest.fn().mockResolvedValue({ id: 'col-01', code: 'FORM', slug: 'form', name: 'FORM' }),
        },
        collectionTranslation: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      }),
    ),
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockAdminUser.id) return Promise.resolve(mockAdminUser);
        if (where.id === mockCustomerUser.id) return Promise.resolve(mockCustomerUser);
        return Promise.resolve(null);
      }),
    },
    category: {
      findUnique: jest.fn().mockResolvedValue({ id: '00000000-0000-0000-0002-000000000001', name: 'Outerwear' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    collection: {
      findUnique: jest.fn().mockResolvedValue({ id: '00000000-0000-0000-0003-000000000001', name: 'FORM' }),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([
        {
          id: '00000000-0000-0000-0003-000000000001',
          code: 'FORM',
          slug: 'form',
          name: 'FORM — Chapter 01',
          description: 'Architectural geometry',
          coverImageUrl: null,
          status: 'published',
          sortOrder: 1,
          translations: [],
          _count: { products: 1 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      delete: jest.fn().mockResolvedValue({}),
    },
    product: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([mockProduct]),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where?.OR && Array.isArray(where.OR)) {
          const isLookup = where.OR.some(
            (o: any) => o.id === mockProduct.id || o.slug === mockProduct.slug,
          );
          if (isLookup) return Promise.resolve(mockProduct);
        }
        return Promise.resolve(null);
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockProduct.id) return Promise.resolve(mockProduct);
        return Promise.resolve(null);
      }),
      update: jest.fn().mockResolvedValue({ ...mockProduct, status: ProductStatus.archived }),
    },
    productVariant: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockProduct.variants[0].id) return Promise.resolve({ ...mockProduct.variants[0], orderItems: [] });
        return Promise.resolve(null);
      }),
      delete: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue(mockProduct.variants[0]),
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
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authorization checks for /api/v1/admin/*', () => {
    it('should return 401 Unauthorized for unauthenticated request', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/products')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should return 403 Forbidden for customer role', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });

    it('should allow admin role to access GET /api/v1/admin/products', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data[0].skuRoot).toBe('NV-JKT-001');
    });
  });

  describe('Product CRUD Operations', () => {
    it('POST /api/v1/admin/products should create product with translations', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          skuRoot: 'NV-JKT-002',
          slug: 'oversized-coat',
          categoryId: '00000000-0000-0000-0002-000000000001',
          basePriceIdr: 2500000,
          translations: [
            { language: LanguageCode.id, name: 'Oversized Coat (ID)' },
            { language: LanguageCode.en, name: 'Oversized Coat (EN)' },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
    });

    it('GET /api/v1/admin/products/:id should retrieve product detail', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/products/00000000-0000-0000-0005-000000000001')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.skuRoot).toBe('NV-JKT-001');
      expect(res.body.basePriceIdr).toBe(1850000);
    });

    it('PATCH /api/v1/admin/products/:id should update product attributes', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/products/00000000-0000-0000-0005-000000000001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          basePriceIdr: 1950000,
        })
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('DELETE /api/v1/admin/products/:id should archive product', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/admin/products/00000000-0000-0000-0005-000000000001')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toContain('archived successfully');
      expect(res.body.status).toBe(ProductStatus.archived);
    });
  });

  describe('Variant Management Operations', () => {
    it('POST /api/v1/admin/products/:id/variants should create variant', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/products/00000000-0000-0000-0005-000000000001/variants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'NV-JKT-001-RAW-M',
          colorName: 'Raw Indigo',
          size: 'M',
          initialStock: 10,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
    });

    it('PATCH /api/v1/admin/variants/:id should update variant', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/variants/00000000-0000-0000-0006-000000000001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priceOverrideIdr: 1900000,
        })
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('DELETE /api/v1/admin/variants/:id should delete variant', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/admin/variants/00000000-0000-0000-0006-000000000001')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toContain('deleted');
    });
  });

  describe('Collections Management Operations', () => {
    it('GET /api/v1/admin/collections should list collections', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/collections')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].code).toBe('FORM');
    });
  });
});
