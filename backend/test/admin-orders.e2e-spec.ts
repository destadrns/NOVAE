import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';
import {
  UserRole,
  UserStatus,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '@prisma/client';

describe('NOVAÉ Admin Orders (e2e)', () => {
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

  const mockOrder = {
    id: 'order-admin-1',
    orderNumber: 'NOV-2026-0104',
    userId: mockCustomer.id,
    customerEmail: mockCustomer.email,
    status: OrderStatus.pending,
    paymentStatus: PaymentStatus.pending,
    fulfillmentStatus: FulfillmentStatus.unfulfilled,
    subtotalIdr: 2500000n,
    discountIdr: 0n,
    shippingIdr: 0n,
    taxIdr: 0n,
    totalIdr: 2500000n,
    currency: 'IDR',
    shippingAddressSnapshot: {
      recipientName: 'Aria Wirasasmita',
      phone: '+62 812-3456-7890',
      email: mockCustomer.email,
      addressLine1: 'Jl. Senopati No. 42',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
    },
    placedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: mockCustomer.id, fullName: 'Aria Wirasasmita', email: mockCustomer.email },
    items: [
      {
        id: 'oi-1',
        orderId: 'order-admin-1',
        productId: 'prod-1',
        variantId: 'var-1',
        productNameSnapshot: 'Oversized Form Jacket',
        skuSnapshot: 'NOV-OFSJ-BLK-M',
        colorSnapshot: 'Obsidian Black',
        sizeSnapshot: 'M',
        unitPriceIdr: 2500000n,
        quantity: 1,
        lineTotalIdr: 2500000n,
        product: { id: 'prod-1', images: [] },
        variant: {
          id: 'var-1',
          images: [],
          inventory: { quantityOnHand: 10, reservedQuantity: 1 },
        },
      },
    ],
    statusHistory: [
      {
        id: 'sh-1',
        orderId: 'order-admin-1',
        fromStatus: null,
        toStatus: OrderStatus.pending,
        note: 'Order created',
        changedBy: mockCustomer.id,
        createdAt: new Date(),
        user: { fullName: 'Aria Wirasasmita', email: mockCustomer.email },
      },
    ],
    payments: [
      {
        id: 'pay-1',
        orderId: 'order-admin-1',
        provider: 'manual',
        method: 'PENDING_SELECTION',
        amountIdr: 2500000n,
        status: PaymentStatus.pending,
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    shipment: null,
  };

  const mockPrisma: any = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockAdmin.id || where.email === mockAdmin.email) return Promise.resolve(mockAdmin);
        if (where.id === mockCustomer.id || where.email === mockCustomer.email) return Promise.resolve(mockCustomer);
        return Promise.resolve(null);
      }),
      create: jest.fn().mockResolvedValue(mockAdmin),
    },
    order: {
      findMany: jest.fn().mockResolvedValue([mockOrder]),
      findUnique: jest.fn().mockResolvedValue(mockOrder),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockResolvedValue(mockOrder),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
    inventory: {
      update: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    shipment: {
      create: jest.fn(),
      update: jest.fn(),
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

  describe('GET /api/v1/admin/orders', () => {
    it('should reject unauthenticated access with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .expect(401);
    });

    it('should reject customer access with 403', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should return paginated orders for admin with 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.totalItems).toBeDefined();
    });
  });

  describe('GET /api/v1/admin/orders/:id', () => {
    it('should return detailed order for admin with status history and inventory', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders/order-admin-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.orderNumber).toBe('NOV-2026-0104');
      expect(response.body.statusHistory).toBeDefined();
      expect(Array.isArray(response.body.statusHistory)).toBe(true);
      expect(response.body.allowedTransitions).toBeDefined();
      expect(Array.isArray(response.body.allowedTransitions)).toBe(true);
      expect(response.body.items[0].inventory).toBeDefined();
    });

    it('should return 404 for non-existent order', async () => {
      mockPrisma.order.findUnique.mockResolvedValueOnce(null);

      await request(app.getHttpServer())
        .get('/api/v1/admin/orders/non-existent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/admin/orders/:id/status', () => {
    it('should reject invalid status transition with 400', async () => {
      // pending → delivered is not allowed
      const response = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-admin-1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered', note: 'Trying invalid transition' })
        .expect(400);

      expect(response.body.message).toContain('Cannot transition');
    });

    it('should update order status with valid transition and 200', async () => {
      // pending → paid is allowed
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.paid,
        statusHistory: [
          ...mockOrder.statusHistory,
          {
            id: 'sh-2',
            orderId: 'order-admin-1',
            fromStatus: OrderStatus.pending,
            toStatus: OrderStatus.paid,
            note: 'Payment confirmed',
            changedBy: mockAdmin.id,
            createdAt: new Date(),
            user: { fullName: 'Admin Atelier', email: mockAdmin.email },
          },
        ],
      };

      mockPrisma.order.findUnique
        .mockResolvedValueOnce(mockOrder) // First call for validation
        .mockResolvedValueOnce(updatedOrder); // Second call for return

      const response = await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-admin-1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'paid', note: 'Payment confirmed via BCA transfer' })
        .expect(200);

      expect(response.body.status).toBe('paid');
      expect(mockPrisma.orderStatusHistory.create).toHaveBeenCalled();
    });

    it('should reject customer from updating order status with 403', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/admin/orders/order-admin-1/status')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'paid' })
        .expect(403);
    });
  });
});
