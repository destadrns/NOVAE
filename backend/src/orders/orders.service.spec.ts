import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  UserRole,
  UserStatus,
  ProductStatus,
  VariantStatus,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  CartStatus,
  InventoryMovementType,
  LanguageCode,
} from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;

  const mockUser: any = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'customer@novae.atelier',
    fullName: 'Aria Wirasasmita',
    role: UserRole.customer,
    status: UserStatus.active,
  };

  const mockAdmin: any = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@novae.atelier',
    fullName: 'Admin Atelier',
    role: UserRole.admin,
    status: UserStatus.active,
  };

  const mockDto = {
    shippingAddress: {
      fullName: 'Aria Wirasasmita',
      email: 'customer@novae.atelier',
      phone: '+62 812-3456-7890',
      street: 'Jl. Senopati No. 42',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
      notes: 'Please handle with care',
      saveAddress: true,
    },
    shippingMethod: 'standard',
    customerNotes: 'Deliver in afternoon',
  };

  const mockVariant = {
    id: 'var-1',
    sku: 'NOV-OFSJ-BLK-M',
    colorName: 'Obsidian Black',
    size: 'M',
    status: VariantStatus.active,
    priceOverrideIdr: null,
    inventory: {
      quantityOnHand: 10,
      reservedQuantity: 2,
      lowStockThreshold: 3,
    },
    images: [{ imageUrl: 'https://images.novae.atelier/jacket.webp', isPrimary: true }],
    product: {
      id: 'prod-1',
      skuRoot: 'NOV-OFSJ',
      slug: 'oversized-form-jacket',
      basePriceIdr: 2500000n,
      status: ProductStatus.active,
      translations: [{ language: LanguageCode.id, name: 'Oversized Form Jacket' }],
      images: [{ imageUrl: 'https://images.novae.atelier/jacket.webp', isPrimary: true }],
    },
  };

  beforeEach(async () => {
    const mockPrisma = {
      cart: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      cartItem: {
        deleteMany: jest.fn(),
      },
      order: {
        count: jest.fn().mockResolvedValue(5),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createOrder', () => {
    it('should successfully place an order from active cart in atomic transaction', async () => {
      const mockCart = {
        id: 'cart-1',
        userId: mockUser.id,
        status: CartStatus.active,
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            variantId: 'var-1',
            quantity: 1,
            variant: mockVariant,
          },
        ],
      };

      prisma.cart.findFirst.mockResolvedValue(mockCart);
      prisma.inventory.findUnique.mockResolvedValue({
        quantityOnHand: 10,
        reservedQuantity: 2,
      });

      const mockCreatedOrder = {
        id: 'order-1',
        orderNumber: 'NOV-2026-0109',
        userId: mockUser.id,
        customerEmail: 'customer@novae.atelier',
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending,
        fulfillmentStatus: FulfillmentStatus.unfulfilled,
        subtotalIdr: 2500000n,
        discountIdr: 0n,
        shippingIdr: 0n, // Subtotal >= 1.500.000 IDR -> Free standard shipping
        taxIdr: 0n,
        totalIdr: 2500000n,
        currency: 'IDR',
        shippingAddressSnapshot: mockDto.shippingAddress,
        placedAt: new Date(),
        createdAt: new Date(),
        items: [
          {
            id: 'oi-1',
            orderId: 'order-1',
            productId: 'prod-1',
            variantId: 'var-1',
            productNameSnapshot: 'Oversized Form Jacket',
            skuSnapshot: 'NOV-OFSJ-BLK-M',
            colorSnapshot: 'Obsidian Black',
            sizeSnapshot: 'M',
            unitPriceIdr: 2500000n,
            quantity: 1,
            lineTotalIdr: 2500000n,
            product: mockVariant.product,
            variant: mockVariant,
          },
        ],
      };

      prisma.order.create.mockResolvedValue(mockCreatedOrder);
      prisma.order.findUnique.mockResolvedValue(mockCreatedOrder);

      const result = await service.createOrder(mockUser, mockDto);

      expect(result).toBeDefined();
      expect(result.orderNumber).toContain('NOV-');
      expect(result.subtotalIdr).toBe(2500000);
      expect(result.shippingIdr).toBe(0); // Free shipping threshold met
      expect(result.totalIdr).toBe(2500000);
      expect(result.status).toBe(OrderStatus.pending);
      expect(result.paymentStatus).toBe(PaymentStatus.pending);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productName).toBe('Oversized Form Jacket');

      // Verify inventory reservation & movement calls
      expect(prisma.inventory.update).toHaveBeenCalledWith({
        where: { variantId: 'var-1' },
        data: { reservedQuantity: { increment: 1 } },
      });
      expect(prisma.inventoryMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            movementType: InventoryMovementType.reservation,
            quantityDelta: 1,
          }),
        }),
      );

      // Verify cart converted
      expect(prisma.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart-1' },
        data: { status: CartStatus.converted },
      });
    });

    it('should calculate shipping fee when subtotal is below free threshold', async () => {
      const cheapVariant = {
        ...mockVariant,
        product: { ...mockVariant.product, basePriceIdr: 800000n },
      };

      const mockCart = {
        id: 'cart-1',
        userId: mockUser.id,
        status: CartStatus.active,
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            variantId: 'var-1',
            quantity: 1,
            variant: cheapVariant,
          },
        ],
      };

      prisma.cart.findFirst.mockResolvedValue(mockCart);
      prisma.inventory.findUnique.mockResolvedValue({
        quantityOnHand: 10,
        reservedQuantity: 0,
      });

      const mockCreatedOrder = {
        id: 'order-2',
        orderNumber: 'NOV-2026-0109',
        userId: mockUser.id,
        customerEmail: 'customer@novae.atelier',
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending,
        fulfillmentStatus: FulfillmentStatus.unfulfilled,
        subtotalIdr: 800000n,
        discountIdr: 0n,
        shippingIdr: 50000n, // Standard shipping under 1.500.000 IDR -> 50.000 IDR
        taxIdr: 0n,
        totalIdr: 850000n,
        currency: 'IDR',
        shippingAddressSnapshot: mockDto.shippingAddress,
        placedAt: new Date(),
        createdAt: new Date(),
        items: [],
      };

      prisma.order.create.mockResolvedValue(mockCreatedOrder);
      prisma.order.findUnique.mockResolvedValue(mockCreatedOrder);

      const result = await service.createOrder(mockUser, mockDto);

      expect(result.shippingIdr).toBe(50000);
      expect(result.totalIdr).toBe(850000);
    });

    it('should throw BadRequestException if cart is empty', async () => {
      prisma.cart.findFirst.mockResolvedValue({
        id: 'cart-empty',
        userId: mockUser.id,
        items: [],
      });

      await expect(service.createOrder(mockUser, mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if product is not active', async () => {
      const inactiveVariant = {
        ...mockVariant,
        product: { ...mockVariant.product, status: ProductStatus.draft },
      };

      prisma.cart.findFirst.mockResolvedValue({
        id: 'cart-1',
        userId: mockUser.id,
        items: [{ id: 'item-1', variantId: 'var-1', quantity: 1, variant: inactiveVariant }],
      });

      await expect(service.createOrder(mockUser, mockDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if requested quantity exceeds available physical stock', async () => {
      const lowStockVariant = {
        ...mockVariant,
        inventory: { quantityOnHand: 5, reservedQuantity: 5 }, // 0 available
      };

      prisma.cart.findFirst.mockResolvedValue({
        id: 'cart-1',
        userId: mockUser.id,
        items: [{ id: 'item-1', variantId: 'var-1', quantity: 1, variant: lowStockVariant }],
      });

      await expect(service.createOrder(mockUser, mockDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getOrderById', () => {
    it('should allow customer to view their own order', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'NOV-2026-0104',
        userId: mockUser.id,
        customerEmail: 'customer@novae.atelier',
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending,
        fulfillmentStatus: FulfillmentStatus.unfulfilled,
        subtotalIdr: 2500000n,
        shippingIdr: 0n,
        taxIdr: 0n,
        discountIdr: 0n,
        totalIdr: 2500000n,
        currency: 'IDR',
        shippingAddressSnapshot: {},
        items: [],
        createdAt: new Date(),
      };

      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById(mockUser, 'order-1');
      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
    });

    it('should forbid other customer from viewing an order they do not own', async () => {
      const otherUser = {
        ...mockUser,
        id: '22222222-2222-2222-2222-222222222222',
      };

      const mockOrder = {
        id: 'order-1',
        userId: mockUser.id, // Owned by mockUser
        items: [],
      };

      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.getOrderById(otherUser, 'order-1')).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to view any customer order', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'NOV-2026-0104',
        userId: mockUser.id,
        customerEmail: 'customer@novae.atelier',
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending,
        fulfillmentStatus: FulfillmentStatus.unfulfilled,
        subtotalIdr: 2500000n,
        shippingIdr: 0n,
        taxIdr: 0n,
        discountIdr: 0n,
        totalIdr: 2500000n,
        currency: 'IDR',
        shippingAddressSnapshot: {},
        items: [],
        createdAt: new Date(),
      };

      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById(mockAdmin, 'order-1');
      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
    });

    it('should throw NotFoundException if order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.getOrderById(mockUser, 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserOrders', () => {
    it('should return all orders placed by the customer', async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          orderNumber: 'NOV-2026-0104',
          userId: mockUser.id,
          subtotalIdr: 2500000n,
          shippingIdr: 0n,
          taxIdr: 0n,
          discountIdr: 0n,
          totalIdr: 2500000n,
          currency: 'IDR',
          status: OrderStatus.pending,
          paymentStatus: PaymentStatus.pending,
          fulfillmentStatus: FulfillmentStatus.unfulfilled,
          shippingAddressSnapshot: {},
          items: [],
          createdAt: new Date(),
        },
      ]);

      const result = await service.getUserOrders(mockUser);
      expect(result).toHaveLength(1);
      expect(result[0].orderNumber).toBe('NOV-2026-0104');
    });
  });
});
