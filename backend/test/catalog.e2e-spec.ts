import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';
import { LanguageCode, ProductStatus, VariantStatus } from '@prisma/client';

describe('NOVAÉ Catalog API (e2e)', () => {
  let app: INestApplication;

  const mockCategories = [
    { id: '00000000-0000-0000-0002-000000000001', slug: 'outerwear', name: 'Outerwear', description: 'Jackets and coats', isActive: true, sortOrder: 1 },
    { id: '00000000-0000-0000-0002-000000000002', slug: 'tops', name: 'Tops', description: 'Shirts and knits', isActive: true, sortOrder: 2 },
    { id: '00000000-0000-0000-0002-000000000003', slug: 'bottoms', name: 'Bottoms', description: 'Trousers and pants', isActive: true, sortOrder: 3 },
    { id: '00000000-0000-0000-0002-000000000004', slug: 'accessories', name: 'Accessories', description: 'Bags and modular add-ons', isActive: true, sortOrder: 4 },
  ];

  const mockCollections = [
    {
      id: '00000000-0000-0000-0003-000000000001',
      code: 'FORM',
      slug: 'form',
      name: 'FORM — Chapter 01',
      description: 'Eksplorasi siluet terstruktur',
      coverImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae',
      status: 'published',
      sortOrder: 1,
      translations: [
        { id: 't-01', collectionId: '00000000-0000-0000-0003-000000000001', language: LanguageCode.id, name: 'FORM — Chapter 01 (ID)', description: 'Eksplorasi siluet terstruktur' },
        { id: 't-02', collectionId: '00000000-0000-0000-0003-000000000001', language: LanguageCode.en, name: 'FORM — Chapter 01 (EN)', description: 'Exploration of structured architectural silhouettes' },
      ],
    },
    {
      id: '00000000-0000-0000-0003-000000000002',
      code: 'MOTION',
      slug: 'motion',
      name: 'MOTION — Chapter 02',
      description: 'Dinamika gerak dan kain fluid',
      coverImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
      status: 'published',
      sortOrder: 2,
      translations: [],
    },
    {
      id: '00000000-0000-0000-0003-000000000003',
      code: 'IDENTITY',
      slug: 'identity',
      name: 'IDENTITY — Chapter 03',
      description: 'Manifesto personal dan avant-garde tailoring',
      coverImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      status: 'published',
      sortOrder: 3,
      translations: [],
    },
  ];

  const mockProductJacket = {
    id: '00000000-0000-0000-0005-000000000001',
    skuRoot: 'NV-JKT-001',
    slug: 'oversized-form-jacket',
    categoryId: '00000000-0000-0000-0002-000000000001',
    collectionId: '00000000-0000-0000-0003-000000000001',
    basePriceIdr: BigInt(1850000),
    status: ProductStatus.active,
    featured: true,
    isNewDrop: true,
    limitedRun: false,
    featuredRank: 1,
    primaryImageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    category: mockCategories[0],
    collection: mockCollections[0],
    translations: [
      {
        id: 'pt-01',
        productId: '00000000-0000-0000-0005-000000000001',
        language: LanguageCode.id,
        name: 'Oversized Form Jacket (ID)',
        shortDescription: 'Jaket struktural bervolume lebar.',
        description: 'Deskripsi lengkap bahasa Indonesia.',
        materialDescription: '14oz Kurabo Japanese Selvedge Raw Denim.',
        provenanceText: 'Dibuat di Bandung atelier.',
      },
      {
        id: 'pt-02',
        productId: '00000000-0000-0000-0005-000000000001',
        language: LanguageCode.en,
        name: 'Oversized Form Jacket (EN)',
        shortDescription: 'Wide structured jacket in Japanese Selvedge Raw Denim.',
        description: 'Architectural exploration of silhouette in Selvedge denim.',
        materialDescription: '14oz Kurabo Japanese Selvedge Raw Denim, 100% Organic Cotton.',
        provenanceText: 'Handcrafted in limited batches at Bandung atelier.',
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
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985',
        createdAt: new Date('2026-01-01'),
        inventory: {
          id: 'inv-01',
          variantId: '00000000-0000-0000-0006-000000000001',
          quantityOnHand: 6,
          reservedQuantity: 0,
        },
      },
    ],
    images: [
      {
        id: '00000000-0000-0000-0007-000000000001',
        productId: '00000000-0000-0000-0005-000000000001',
        variantId: null,
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985',
        altText: 'Oversized Form Jacket — Front Shot',
        sortOrder: 0,
        isPrimary: true,
      },
    ],
    tagMaps: [
      {
        productId: '00000000-0000-0000-0005-000000000001',
        tagId: 'tag-01',
        tag: { id: 'tag-01', name: 'Oversized' },
      },
    ],
  };

  const mockProductKimono = {
    id: '00000000-0000-0000-0005-000000000003',
    skuRoot: 'NV-TOP-001',
    slug: 'fluid-motion-kimono-shirt',
    categoryId: '00000000-0000-0000-0002-000000000002',
    collectionId: '00000000-0000-0000-0003-000000000002',
    basePriceIdr: BigInt(1250000),
    status: ProductStatus.active,
    featured: true,
    isNewDrop: true,
    limitedRun: false,
    featuredRank: 3,
    primaryImageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
    createdAt: new Date('2026-01-03T00:00:00Z'),
    updatedAt: new Date('2026-01-03T00:00:00Z'),
    category: mockCategories[1],
    collection: mockCollections[1],
    translations: [
      {
        id: 'pt-05',
        productId: '00000000-0000-0000-0005-000000000003',
        language: LanguageCode.id,
        name: 'Fluid Motion Kimono Shirt',
        shortDescription: 'Kemeja kimono kontemporer dengan potongan drape santai.',
        description: 'Kemeja berpotongan kimono modern.',
        materialDescription: 'Tencel Lyocell blend.',
        provenanceText: 'Dibuat di Bandung.',
      },
    ],
    variants: [],
    images: [],
    tagMaps: [],
  };

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    isHealthy: jest.fn().mockResolvedValue(true),
    category: {
      findMany: jest.fn().mockResolvedValue(mockCategories),
    },
    collection: {
      findMany: jest.fn().mockResolvedValue(mockCollections),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const found = mockCollections.find((c) => c.slug === where.slug);
        return Promise.resolve(found || null);
      }),
    },
    product: {
      count: jest.fn().mockImplementation(({ where }) => {
        if (where?.category?.slug === 'outerwear') return Promise.resolve(1);
        if (where?.OR) return Promise.resolve(1); // search
        return Promise.resolve(2);
      }),
      findMany: jest.fn().mockImplementation(({ where }) => {
        if (where?.category?.slug === 'outerwear') return Promise.resolve([mockProductJacket]);
        if (where?.OR) return Promise.resolve([mockProductKimono]); // search
        return Promise.resolve([mockProductJacket, mockProductKimono]);
      }),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where.slug === mockProductJacket.slug) return Promise.resolve(mockProductJacket);
        if (where.slug === mockProductKimono.slug) return Promise.resolve(mockProductKimono);
        return Promise.resolve(null);
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
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------------------------------------------------
  // CATEGORIES ENDPOINT
  // ------------------------------------------------------------
  describe('GET /api/v1/categories', () => {
    it('should return 200 with list of active categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(4);
      expect(res.body[0]).toHaveProperty('slug', 'outerwear');
      expect(res.body[1]).toHaveProperty('slug', 'tops');
    });
  });

  // ------------------------------------------------------------
  // COLLECTIONS ENDPOINTS
  // ------------------------------------------------------------
  describe('GET /api/v1/collections', () => {
    it('should return 200 with list of published collections', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/collections')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toHaveProperty('code', 'FORM');
      expect(res.body[0]).toHaveProperty('slug', 'form');
    });

    it('should return localized English content when requested', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/collections?language=en')
        .expect(200);

      expect(res.body[0].name).toBe('FORM — Chapter 01 (EN)');
      expect(res.body[0].description).toBe('Exploration of structured architectural silhouettes');
    });
  });

  describe('GET /api/v1/collections/:slug', () => {
    it('should return collection detail for existing slug', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/collections/form?language=en')
        .expect(200);

      expect(res.body).toHaveProperty('slug', 'form');
      expect(res.body).toHaveProperty('code', 'FORM');
      expect(res.body.name).toBe('FORM — Chapter 01 (EN)');
    });

    it('should return 404 for non-existent collection slug', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/collections/non-existent-collection')
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });
  });

  // ------------------------------------------------------------
  // PRODUCTS LIST & FILTERING ENDPOINTS
  // ------------------------------------------------------------
  describe('GET /api/v1/products', () => {
    it('should return paginated list of products with metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(12);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('slug', 'oversized-form-jacket');
      expect(res.body.data[0].basePriceIdr).toBe(1850000);
      expect(res.body.data[0].inStock).toBe(true);
    });

    it('should return English localized product list items', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products?language=en')
        .expect(200);

      expect(res.body.data[0].name).toBe('Oversized Form Jacket (EN)');
      expect(res.body.data[0].shortDescription).toContain('Japanese Selvedge Raw Denim');
    });

    it('should filter by category correctly', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products?category=outerwear')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].categorySlug).toBe('outerwear');
    });

    it('should search products by free text', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products?search=kimono')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].slug).toBe('fluid-motion-kimono-shirt');
    });

    it('should return 400 Bad Request if invalid query parameter limit exceeds maximum', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products?limit=999')
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.error).toBe('Bad Request');
    });
  });

  // ------------------------------------------------------------
  // PRODUCT DETAIL BY SLUG ENDPOINT
  // ------------------------------------------------------------
  describe('GET /api/v1/products/:slug', () => {
    it('should return complete localized product detail by slug', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products/oversized-form-jacket?language=en')
        .expect(200);

      expect(res.body).toHaveProperty('id', '00000000-0000-0000-0005-000000000001');
      expect(res.body).toHaveProperty('slug', 'oversized-form-jacket');
      expect(res.body.name).toBe('Oversized Form Jacket (EN)');
      expect(res.body.category.slug).toBe('outerwear');
      expect(res.body.collection.code).toBe('FORM');
      expect(res.body.isPurchasable).toBe(true);
      expect(res.body.images).toHaveLength(1);
      expect(res.body.variants).toHaveLength(1);
      expect(res.body.variants[0].sku).toBe('NV-JKT-001-RAW-S');
      expect(res.body.variants[0].inStock).toBe(true);
      expect(res.body.variants[0].availableQuantity).toBe(6);
    });

    it('should return 404 for non-existent product slug', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products/non-existent-jacket')
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });
  });
});
