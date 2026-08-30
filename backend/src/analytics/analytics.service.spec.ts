import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../database/prisma.service';
import { OrderStatus, LanguageCode } from '@prisma/client';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: any;

  const mockOrders = [
    {
      id: 'ord-1',
      orderNumber: 'NOV-2026-0104',
      customerEmail: 'alex.tan@fashion.sg',
      status: OrderStatus.delivered,
      totalIdr: 1548000n,
      createdAt: new Date('2026-08-25T10:00:00Z'),
      shippingAddressSnapshot: { recipientName: 'Alex Tan', city: 'Jakarta Selatan' },
      items: [
        { productId: 'prod-1', quantity: 1, lineTotalIdr: 899000n },
        { productId: 'prod-2', quantity: 1, lineTotalIdr: 649000n },
      ],
    },
    {
      id: 'ord-2',
      orderNumber: 'NOV-2026-0105',
      customerEmail: 'sarah.c@minimal.io',
      status: OrderStatus.shipped,
      totalIdr: 1238000n,
      createdAt: new Date('2026-08-26T14:30:00Z'),
      shippingAddressSnapshot: { recipientName: 'Sarah Chen', city: 'Surabaya' },
      items: [
        { productId: 'prod-3', quantity: 2, lineTotalIdr: 1178000n },
      ],
    },
  ];

  const mockInventory = [
    {
      id: 'inv-1',
      quantityOnHand: 10,
      reservedQuantity: 2,
      lowStockThreshold: 3,
      variant: {
        id: 'var-1',
        sku: 'NOV-FRM-01-BLK-M',
        colorName: 'Obsidian Black',
        size: 'M',
        product: {
          id: 'prod-1',
          slug: 'oversized-form-jacket',
          translations: [{ language: LanguageCode.id, name: 'Oversized Form Jacket' }],
        },
      },
    },
    {
      id: 'inv-2',
      quantityOnHand: 2,
      reservedQuantity: 1,
      lowStockThreshold: 3,
      variant: {
        id: 'var-2',
        sku: 'NOV-FRM-02-BLK-S',
        colorName: 'Obsidian Black',
        size: 'S',
        product: {
          id: 'prod-2',
          slug: 'sculpted-tailored-trouser',
          translations: [{ language: LanguageCode.id, name: 'Sculpted Tailored Trouser' }],
        },
      },
    },
  ];

  const mockCollections = [
    {
      id: 'col-1',
      code: 'FORM',
      name: 'FORM',
      description: 'Architectural Heavyweight',
      translations: [{ language: LanguageCode.id, name: 'FORM' }],
      products: [{ id: 'prod-1', variants: [] }, { id: 'prod-2', variants: [] }],
    },
    {
      id: 'col-2',
      code: 'MOTION',
      name: 'MOTION',
      description: 'Kinetic Cupro & Sandwashed',
      translations: [{ language: LanguageCode.id, name: 'MOTION' }],
      products: [{ id: 'prod-3', variants: [] }],
    },
  ];

  const mockPrisma = {
    order: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
    inventory: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    cart: {
      count: jest.fn(),
    },
    wishlistItem: {
      count: jest.fn(),
    },
    collection: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    styleProfile: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardOverview', () => {
    it('should aggregate correct metrics and structure overview response', async () => {
      mockPrisma.order.findMany.mockImplementation((args) => {
        if (args?.take === 5) return Promise.resolve(mockOrders);
        return Promise.resolve(mockOrders);
      });
      mockPrisma.inventory.findMany.mockResolvedValue(mockInventory);
      mockPrisma.user.count.mockResolvedValue(5);
      mockPrisma.cart.count.mockResolvedValue(3);
      mockPrisma.wishlistItem.count.mockResolvedValue(7);
      mockPrisma.collection.findMany.mockResolvedValue(mockCollections);
      mockPrisma.order.groupBy.mockResolvedValue([
        { status: OrderStatus.delivered, _count: { id: 1 } },
        { status: OrderStatus.shipped, _count: { id: 1 } },
      ]);
      mockPrisma.orderItem.groupBy.mockResolvedValue([
        { productId: 'prod-1', _sum: { quantity: 1, lineTotalIdr: 899000n } },
        { productId: 'prod-3', _sum: { quantity: 2, lineTotalIdr: 1178000n } },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([
        {
          id: 'prod-1',
          slug: 'oversized-form-jacket',
          skuRoot: 'NOV-FRM-01',
          category: { name: 'Outerwear' },
          translations: [{ language: LanguageCode.id, name: 'Oversized Form Jacket' }],
        },
        {
          id: 'prod-3',
          slug: 'fluid-motion-kimono-shirt',
          skuRoot: 'NOV-MOT-03',
          category: { name: 'Tops' },
          translations: [{ language: LanguageCode.id, name: 'Fluid Motion Kimono Shirt' }],
        },
      ]);
      mockPrisma.styleProfile.count.mockResolvedValue(4);
      mockPrisma.styleProfile.groupBy.mockResolvedValue([
        { archetypeCode: 'ARCHITECTURAL_MINIMALIST', _count: { id: 3 } },
        { archetypeCode: 'KINETIC_DRAPED', _count: { id: 1 } },
      ]);

      const result = await service.getDashboardOverview({ range: '30d' });

      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.metrics.grossSales).toBe(2786000);
      expect(result.metrics.totalOrders).toBe(2);
      expect(result.metrics.totalPiecesSold).toBe(4);
      expect(result.metrics.totalPiecesInStock).toBe(12);
      expect(result.metrics.lowStockItemsCount).toBe(1);
      expect(result.lowStockAlerts).toHaveLength(1);
      expect(result.lowStockAlerts[0].sku).toBe('NOV-FRM-02-BLK-S');
      expect(result.customerActivity.totalCustomers).toBe(5);
      expect(result.customerActivity.activeCarts).toBe(3);
      expect(result.customerActivity.totalWishlistItems).toBe(7);
      expect(result.styleFinder.totalProfiles).toBe(4);
      expect(result.styleFinder.archetypeDistribution['ARCHITECTURAL_MINIMALIST']).toBe(3);
      expect(result.recentOrders).toHaveLength(2);
      expect(result.topSellingProducts).toHaveLength(2);
      expect(result.capsuleDistribution.length).toBeGreaterThan(0);
    });
  });
});
