import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';
import {
  LanguageCode,
  ProductStatus,
  UserRole,
  UserStatus,
  VariantStatus,
} from '@prisma/client';

describe('NOVAÉ Cart & Wishlist (e2e)', () => {
  let app: INestApplication;
  const jwtSecret = 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';

  const mockCustomerUser = {
    id: '00000000-0000-0000-0001-000000000001',
    email: 'aria.wirasasmita@client.novae.atelier',
    fullName: 'Aria Wirasasmita',
    role: UserRole.customer,
    status: UserStatus.active,
  };

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
    images: [{ imageUrl: 'https://images.unsplash.com/jacket.jpg', isPrimary: true }],
    category: { name: 'Outerwear' },
    collection: { code: 'FORM' },
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
    inventory: {
      quantityOnHand: 10,
      reservedQuantity: 2,
      lowStockThreshold: 3,
    },
    images: [],
  };

  const mockCartItem = {
    id: '00000000-0000-0000-0008-000000000001',
    cartId: '00000000-0000-0000-0007-000000000001',
    variantId: mockVariant.id,
    quantity: 1,
    unitPriceSnapshotIdr: BigInt(1850000),
    createdAt: new Date('2026-08-30T00:00:00Z'),
    updatedAt: new Date('2026-08-30T00:00:00Z'),
    variant: mockVariant,
  };

  const mockCart = {
    id: '00000000-0000-0000-0007-000000000001',
    userId: mockCustomerUser.id,
    sessionKey: null,
    status: 'active',
    currency: 'IDR',
    createdAt: new Date('2026-08-30T00:00:00Z'),
    updatedAt: new Date('2026-08-30T00:00:00Z'),
    items: [mockCartItem],
  };

  const mockGuestCart = {
    id: '00000000-0000-0000-0007-000000000002',
    userId: null,
    sessionKey: 'guest-session-12345',
    status: 'active',
    currency: 'IDR',
    createdAt: new Date('2026-08-30T00:00:00Z'),
    updatedAt: new Date('2026-08-30T00:00:00Z'),
    items: [mockCartItem],
  };

  const mockWishlistItem = {
    id: '00000000-0000-0000-0009-000000000001',
    wishlistId: '00000000-0000-0000-0008-000000000001',
    productId: mockProduct.id,
    createdAt: new Date('2026-08-30T00:00:00Z'),
    product: {
      ...mockProduct,
      variants: [mockVariant],
    },
  };

  const mockWishlist = {
    id: '00000000-0000-0000-0008-000000000001',
    userId: mockCustomerUser.id,
    items: [mockWishlistItem],
  };

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    isHealthy: jest.fn().mockResolvedValue(true),
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockCustomerUser.id) return Promise.resolve(mockCustomerUser);
        return Promise.resolve(null);
      }),
    },
    cart: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where.userId === mockCustomerUser.id) return Promise.resolve(mockCart);
        return Promise.resolve(null);
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.sessionKey === 'guest-session-12345') return Promise.resolve(mockGuestCart);
        return Promise.resolve(mockCart);
      }),
      create: jest.fn().mockResolvedValue(mockCart),
      update: jest.fn().mockResolvedValue(mockCart),
    },
    cartItem: {
      findFirst: jest.fn().mockResolvedValue(mockCartItem),
      findUnique: jest.fn().mockResolvedValue(mockCartItem),
      create: jest.fn().mockResolvedValue(mockCartItem),
      update: jest.fn().mockResolvedValue(mockCartItem),
      upsert: jest.fn().mockResolvedValue(mockCartItem),
      delete: jest.fn().mockResolvedValue(mockCartItem),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    productVariant: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockVariant.id) return Promise.resolve(mockVariant);
        return Promise.resolve(null);
      }),
    },
    product: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockProduct.id) return Promise.resolve(mockProduct);
        return Promise.resolve(null);
      }),
    },
    wishlist: {
      findUnique: jest.fn().mockResolvedValue(mockWishlist),
      create: jest.fn().mockResolvedValue(mockWishlist),
    },
    wishlistItem: {
      upsert: jest.fn().mockResolvedValue(mockWishlistItem),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn().mockImplementation((cb) =>
      cb({
        cartItem: {
          findUnique: jest.fn().mockResolvedValue(mockCartItem),
          upsert: jest.fn().mockResolvedValue(mockCartItem),
        },
        cart: {
          update: jest.fn().mockResolvedValue(mockCart),
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

  describe('Cart Endpoints (/api/v1/cart)', () => {
    it('GET /api/v1/cart with guest session header should return active cart', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('x-session-key', 'guest-session-12345')
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('subtotalIdr');
      expect(res.body.currency).toBe('IDR');
    });

    it('GET /api/v1/cart with customer token should return authenticated user cart', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.userId).toBe(mockCustomerUser.id);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.items[0].sku).toBe('NV-JKT-001-RAW-S');
    });

    it('POST /api/v1/cart/items should add item to cart', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          variantId: mockVariant.id,
          quantity: 1,
        })
        .expect(201);

      expect(res.body).toHaveProperty('items');
    });

    it('PATCH /api/v1/cart/items/:itemId should update item quantity', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/cart/items/${mockCartItem.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          quantity: 2,
        })
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });

    it('DELETE /api/v1/cart/items/:itemId should remove item from cart', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/cart/items/${mockCartItem.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });

    it('DELETE /api/v1/cart should clear cart items', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });

    it('POST /api/v1/cart/merge should merge guest session cart into user cart', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cart/merge')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          guestSessionKey: 'guest-session-12345',
        })
        .expect(200);

      expect(res.body.userId).toBe(mockCustomerUser.id);
    });
  });

  describe('Wishlist Endpoints (/api/v1/wishlist)', () => {
    it('GET /api/v1/wishlist without token should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/wishlist')
        .expect(401);
    });

    it('GET /api/v1/wishlist with customer token should return user wishlist', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body.userId).toBe(mockCustomerUser.id);
      expect(res.body.items[0].name).toBe('Oversized Form Jacket (ID)');
      expect(res.body.items[0].isAvailable).toBe(true);
    });

    it('POST /api/v1/wishlist/items should add product to wishlist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/wishlist/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: mockProduct.id,
        })
        .expect(201);

      expect(res.body).toHaveProperty('items');
    });

    it('DELETE /api/v1/wishlist/items/:productId should remove product from wishlist', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/wishlist/items/${mockProduct.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });

    it('DELETE /api/v1/wishlist should clear all items from wishlist', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/wishlist')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
    });
  });
});
