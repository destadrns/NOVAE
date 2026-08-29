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
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '@prisma/client';

describe('NOVAÉ Orders (e2e)', () => {
  let app: INestApplication;
  const jwtSecret = 'novae-super-secret-jwt-key-for-local-dev-and-testing-min-32-chars';

  const mockCustomer = {
    id: '00000000-0000-0000-0001-000000000001',
    email: 'aria.wirasasmita@client.novae.atelier',
    fullName: 'Aria Wirasasmita',
    role: UserRole.customer,
    status: UserStatus.active,
  };

  const mockOtherCustomer = {
    id: '00000000-0000-0000-0001-000000000002',
    email: 'maya.lestari@client.novae.atelier',
    fullName: 'Maya Lestari',
    role: UserRole.customer,
    status: UserStatus.active,
  };

  const mockAdmin = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@novae.atelier',
    fullName: 'Admin Atelier',
    role: UserRole.admin,
    status: UserStatus.active,
  };

  const customerToken = jwt.sign(
    { sub: mockCustomer.id, email: mockCustomer.email },
    jwtSecret,
    { expiresIn: '1h' },
  );

  const otherCustomerToken = jwt.sign(
    { sub: mockOtherCustomer.id, email: mockOtherCustomer.email },
    jwtSecret,
    { expiresIn: '1h' },
  );

  const adminToken = jwt.sign(
    { sub: mockAdmin.id, email: mockAdmin.email },
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
  };

  const mockVariant = {
    id: '00000000-0000-0000-0006-000000000001',
    productId: mockProduct.id,
    sku: 'NV-JKT-001-RAW-S',
    colorName: 'Raw Indigo',
    size: 'S',
    priceOverrideIdr: null,
    status: VariantStatus.active,
    product: mockProduct,
    inventory: {
      quantityOnHand: 15,
      reservedQuantity: 0,
      lowStockThreshold: 3,
    },
    images: [{ imageUrl: 'https://images.unsplash.com/jacket.jpg', isPrimary: true }],
  };

  const mockOrderDto = {
    shippingAddress: {
      fullName: 'Aria Wirasasmita',
      email: 'aria.wirasasmita@client.novae.atelier',
      phone: '+62 812-3456-7890',
      street: 'Jl. Senopati No. 42',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
      notes: 'Drop with receptionist',
      saveAddress: true,
    },
    shippingMethod: 'standard',
    customerNotes: 'Atelier packaging requested',
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockCustomer.id || where.email === mockCustomer.email) {
          return Promise.resolve(mockCustomer);
        }
        if (where.id === mockOtherCustomer.id || where.email === mockOtherCustomer.email) {
          return Promise.resolve(mockOtherCustomer);
        }
        if (where.id === mockAdmin.id || where.email === mockAdmin.email) {
          return Promise.resolve(mockAdmin);
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockResolvedValue(mockCustomer),
    },
    cart: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
    order: {
      count: jest.fn().mockResolvedValue(5),
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    inventory: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    address: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrisma)),
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

  describe('POST /api/v1/orders', () => {
    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(mockOrderDto)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should reject when cart is empty with 400 Bad Request', async () => {
      mockPrisma.cart.findFirst.mockResolvedValueOnce({
        id: 'cart-empty',
        userId: mockCustomer.id,
        items: [],
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(mockOrderDto)
        .expect(400);

      expect(response.body.message).toContain('Cart is empty');
    });

    it('should reject when physical stock is insufficient with 409 Conflict', async () => {
      const lowStockCart = {
        id: 'cart-1',
        userId: mockCustomer.id,
        items: [
          {
            id: 'ci-1',
            cartId: 'cart-1',
            variantId: mockVariant.id,
            quantity: 5,
            variant: {
              ...mockVariant,
              inventory: { quantityOnHand: 2, reservedQuantity: 0 },
            },
          },
        ],
      };

      mockPrisma.cart.findFirst.mockResolvedValueOnce(lowStockCart);

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(mockOrderDto)
        .expect(409);

      expect(response.body.message).toContain('Insufficient stock');
    });

    it('should successfully place an order from customer active cart with 201 Created', async () => {
      const activeCart = {
        id: 'cart-1',
        userId: mockCustomer.id,
        status: 'active',
        items: [
          {
            id: 'ci-1',
            cartId: 'cart-1',
            variantId: mockVariant.id,
            quantity: 1,
            variant: mockVariant,
          },
        ],
      };

      mockPrisma.cart.findFirst.mockResolvedValueOnce(activeCart);
      mockPrisma.inventory.findUnique.mockResolvedValue({
        quantityOnHand: 15,
        reservedQuantity: 0,
      });

      const mockOrderCreated = {
        id: '00000000-0000-0000-0009-000000000001',
        orderNumber: 'NOV-2026-0109',
        userId: mockCustomer.id,
        customerEmail: mockOrderDto.shippingAddress.email,
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending,
        fulfillmentStatus: FulfillmentStatus.unfulfilled,
        subtotalIdr: 1850000n,
        discountIdr: 0n,
        shippingIdr: 0n, // Subtotal >= 1.500.000 -> Free shipping
        taxIdr: 0n,
        totalIdr: 1850000n,
        currency: 'IDR',
        shippingAddressSnapshot: mockOrderDto.shippingAddress,
        placedAt: new Date(),
        createdAt: new Date(),
        items: [
          {
            id: 'oi-1',
            orderId: '00000000-0000-0000-0009-000000000001',
            productId: mockProduct.id,
            variantId: mockVariant.id,
            productNameSnapshot: 'Oversized Form Jacket (ID)',
            skuSnapshot: mockVariant.sku,
            colorSnapshot: mockVariant.colorName,
            sizeSnapshot: mockVariant.size,
            unitPriceIdr: 1850000n,
            quantity: 1,
            lineTotalIdr: 1850000n,
            product: mockProduct,
            variant: mockVariant,
          },
        ],
      };

      mockPrisma.order.create.mockResolvedValue(mockOrderCreated);
      mockPrisma.order.findUnique.mockResolvedValue(mockOrderCreated);

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(mockOrderDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.orderNumber).toBe('NOV-2026-0109');
      expect(response.body.status).toBe(OrderStatus.pending);
      expect(response.body.paymentStatus).toBe(PaymentStatus.pending);
      expect(response.body.subtotalIdr).toBe(1850000);
      expect(response.body.shippingIdr).toBe(0);
      expect(response.body.totalIdr).toBe(1850000);
      expect(response.body.items).toHaveLength(1);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return customer order history with 200 OK', async () => {
      mockPrisma.order.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0009-000000000001',
          orderNumber: 'NOV-2026-0109',
          userId: mockCustomer.id,
          customerEmail: mockCustomer.email,
          status: OrderStatus.pending,
          paymentStatus: PaymentStatus.pending,
          fulfillmentStatus: FulfillmentStatus.unfulfilled,
          subtotalIdr: 1850000n,
          shippingIdr: 0n,
          taxIdr: 0n,
          discountIdr: 0n,
          totalIdr: 1850000n,
          currency: 'IDR',
          shippingAddressSnapshot: mockOrderDto.shippingAddress,
          items: [],
          placedAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].orderNumber).toBe('NOV-2026-0109');
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    const targetOrderId = '00000000-0000-0000-0009-000000000001';

    it('should return 403 Forbidden if accessed by another customer', async () => {
      mockPrisma.order.findUnique.mockResolvedValueOnce({
        id: targetOrderId,
        userId: mockCustomer.id, // Belongs to mockCustomer
        items: [],
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders/${targetOrderId}`)
        .set('Authorization', `Bearer ${otherCustomerToken}`)
        .expect(403);

      expect(response.body.statusCode).toBe(403);
    });

    it('should allow customer to access their own order with 200 OK', async () => {
      mockPrisma.order.findUnique.mockResolvedValueOnce({
        id: targetOrderId,
        orderNumber: 'NOV-2026-0109',
        userId: mockCustomer.id,
        customerEmail: mockCustomer.email,
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending,
        fulfillmentStatus: FulfillmentStatus.unfulfilled,
        subtotalIdr: 1850000n,
        shippingIdr: 0n,
        taxIdr: 0n,
        discountIdr: 0n,
        totalIdr: 1850000n,
        currency: 'IDR',
        shippingAddressSnapshot: mockOrderDto.shippingAddress,
        items: [],
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders/${targetOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.id).toBe(targetOrderId);
      expect(response.body.orderNumber).toBe('NOV-2026-0109');
    });

    it('should allow admin to inspect any customer order with 200 OK', async () => {
      mockPrisma.order.findUnique.mockResolvedValueOnce({
        id: targetOrderId,
        orderNumber: 'NOV-2026-0109',
        userId: mockCustomer.id,
        customerEmail: mockCustomer.email,
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending,
        fulfillmentStatus: FulfillmentStatus.unfulfilled,
        subtotalIdr: 1850000n,
        shippingIdr: 0n,
        taxIdr: 0n,
        discountIdr: 0n,
        totalIdr: 1850000n,
        currency: 'IDR',
        shippingAddressSnapshot: mockOrderDto.shippingAddress,
        items: [],
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders/${targetOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(targetOrderId);
    });

    it('should return 404 Not Found if order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValueOnce(null);

      await request(app.getHttpServer())
        .get('/api/v1/orders/00000000-0000-0000-0000-000000000999')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);
    });
  });
});
