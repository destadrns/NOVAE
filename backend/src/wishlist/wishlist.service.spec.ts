import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LanguageCode, ProductStatus } from '@prisma/client';

describe('WishlistService', () => {
  let service: WishlistService;
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
    category: { name: 'Outerwear' },
    collection: { code: 'FORM' },
    variants: [
      {
        id: '00000000-0000-0000-0006-000000000001',
        status: 'active',
        inventory: { quantityOnHand: 10, reservedQuantity: 2 },
      },
    ],
  };

  const mockWishlistItem = {
    id: '00000000-0000-0000-0009-000000000001',
    wishlistId: '00000000-0000-0000-0008-000000000001',
    productId: mockProduct.id,
    createdAt: new Date('2026-08-30T00:00:00Z'),
    product: mockProduct,
  };

  const mockWishlist = {
    id: '00000000-0000-0000-0008-000000000001',
    userId: '00000000-0000-0000-0001-000000000001',
    items: [mockWishlistItem],
  };

  const mockPrismaService = {
    wishlist: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    wishlistItem: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getWishlist', () => {
    it('should return user wishlist with formatted items and availability', async () => {
      mockPrismaService.wishlist.findUnique.mockResolvedValue(mockWishlist);

      const result = await service.getWishlist(mockWishlist.userId);

      expect(result.id).toBe(mockWishlist.id);
      expect(result.itemCount).toBe(1);
      expect(result.items[0].name).toBe('Oversized Form Jacket (ID)');
      expect(result.items[0].isAvailable).toBe(true);
      expect(result.items[0].basePriceIdr).toBe(1850000);
    });

    it('should auto-create wishlist if user has none', async () => {
      mockPrismaService.wishlist.findUnique.mockResolvedValue(null);
      mockPrismaService.wishlist.create.mockResolvedValue({
        ...mockWishlist,
        items: [],
      });

      const result = await service.getWishlist(mockWishlist.userId);

      expect(result.itemCount).toBe(0);
      expect(mockPrismaService.wishlist.create).toHaveBeenCalled();
    });
  });

  describe('addItem', () => {
    it('should successfully add active product to wishlist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.wishlist.findUnique.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.upsert.mockResolvedValue(mockWishlistItem);

      const result = await service.addItem(mockWishlist.userId, mockProduct.id);

      expect(mockPrismaService.wishlistItem.upsert).toHaveBeenCalled();
      expect(result.items.length).toBe(1);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem(mockWishlist.userId, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject adding inactive or archived product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        status: ProductStatus.archived,
      });

      await expect(
        service.addItem(mockWishlist.userId, mockProduct.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeItem and clearWishlist', () => {
    it('should remove product from wishlist', async () => {
      mockPrismaService.wishlist.findUnique.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.deleteMany.mockResolvedValue({ count: 1 });

      await service.removeItem(mockWishlist.userId, mockProduct.id);

      expect(mockPrismaService.wishlistItem.deleteMany).toHaveBeenCalled();
    });

    it('should clear all items from wishlist', async () => {
      mockPrismaService.wishlist.findUnique.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.deleteMany.mockResolvedValue({ count: 2 });

      await service.clearWishlist(mockWishlist.userId);

      expect(mockPrismaService.wishlistItem.deleteMany).toHaveBeenCalled();
    });
  });
});
