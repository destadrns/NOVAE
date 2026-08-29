import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LanguageCode, ProductStatus, VariantStatus } from '@prisma/client';

describe('CartService', () => {
  let service: CartService;
  let prisma: PrismaService;

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
    colorCode: '#1C2333',
    size: 'S',
    priceOverrideIdr: null,
    status: VariantStatus.active,
    product: mockProduct,
    inventory: {
      quantityOnHand: 10,
      reservedQuantity: 2, // available: 8
      lowStockThreshold: 3,
    },
    images: [],
  };

  const mockCartItem = {
    id: '00000000-0000-0000-0008-000000000001',
    cartId: '00000000-0000-0000-0007-000000000001',
    variantId: mockVariant.id,
    quantity: 2,
    unitPriceSnapshotIdr: BigInt(1850000),
    createdAt: new Date('2026-08-30T00:00:00Z'),
    updatedAt: new Date('2026-08-30T00:00:00Z'),
    variant: mockVariant,
  };

  const mockCart = {
    id: '00000000-0000-0000-0007-000000000001',
    userId: '00000000-0000-0000-0001-000000000001',
    sessionKey: null,
    status: 'active',
    currency: 'IDR',
    createdAt: new Date('2026-08-30T00:00:00Z'),
    updatedAt: new Date('2026-08-30T00:00:00Z'),
    items: [mockCartItem],
  };

  const mockPrismaService = {
    cart: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cartItem: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return active cart with calculated subtotal and stock availability', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);

      const result = await service.getCart({ userId: mockCart.userId });

      expect(result.id).toBe(mockCart.id);
      expect(result.itemCount).toBe(2);
      expect(result.subtotalIdr).toBe(3700000); // 2 * 1850000
      expect(result.items[0].isAvailable).toBe(true);
      expect(result.items[0].availableQuantity).toBe(8);
    });

    it('should provision a new active cart if none exists', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(null);
      mockPrismaService.cart.create.mockResolvedValue({ ...mockCart, items: [] });

      const result = await service.getCart({ userId: mockCart.userId });

      expect(result.itemCount).toBe(0);
      expect(result.subtotalIdr).toBe(0);
      expect(mockPrismaService.cart.create).toHaveBeenCalled();
    });
  });

  describe('addItem', () => {
    it('should successfully add item when stock is sufficient', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
      mockPrismaService.cartItem.upsert.mockResolvedValue(mockCartItem);
      mockPrismaService.cart.update.mockResolvedValue(mockCart);

      const result = await service.addItem(
        { userId: mockCart.userId },
        { variantId: mockVariant.id, quantity: 2 },
      );

      expect(mockPrismaService.cartItem.upsert).toHaveBeenCalled();
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should reject adding item when requested quantity exceeds available stock', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem(
          { userId: mockCart.userId },
          { variantId: mockVariant.id, quantity: 20 }, // 20 > 8 available
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if variant does not exist', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem(
          { userId: mockCart.userId },
          { variantId: 'unknown-id', quantity: 1 },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject adding inactive or archived variant', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        status: VariantStatus.inactive,
      });

      await expect(
        service.addItem(
          { userId: mockCart.userId },
          { variantId: mockVariant.id, quantity: 1 },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateItem', () => {
    it('should update quantity when valid and stock sufficient', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(mockCartItem);
      mockPrismaService.cartItem.update.mockResolvedValue({ ...mockCartItem, quantity: 3 });
      mockPrismaService.cart.update.mockResolvedValue(mockCart);

      const result = await service.updateItem(
        { userId: mockCart.userId },
        mockCartItem.id,
        { quantity: 3 },
      );

      expect(mockPrismaService.cartItem.update).toHaveBeenCalled();
    });

    it('should delete cart item when quantity is 0', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(mockCartItem);
      mockPrismaService.cartItem.delete.mockResolvedValue(mockCartItem);
      mockPrismaService.cart.update.mockResolvedValue(mockCart);

      await service.updateItem(
        { userId: mockCart.userId },
        mockCartItem.id,
        { quantity: 0 },
      );

      expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
        where: { id: mockCartItem.id },
      });
    });
  });

  describe('removeItem and clearCart', () => {
    it('should delete single item on removeItem', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      await service.removeItem({ userId: mockCart.userId }, mockCartItem.id);

      expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalled();
    });

    it('should delete all items on clearCart', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.deleteMany.mockResolvedValue({ count: 2 });

      await service.clearCart({ userId: mockCart.userId });

      expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: {
          cartId: mockCart.id,
        },
      });
    });
  });
});
