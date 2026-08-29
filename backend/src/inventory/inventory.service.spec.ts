import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  InventoryMovementType,
  LanguageCode,
  ProductStatus,
  VariantStatus,
} from '@prisma/client';
import { InventoryStatusFilter } from './dto/admin-inventory-query.dto';

describe('InventoryService', () => {
  let service: InventoryService;
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
    createdBy: '00000000-0000-0000-0000-000000000001',
    createdAt: new Date('2026-08-30T00:00:00Z'),
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Madame Direktris',
      email: 'admin@novae.atelier',
    },
  };

  const mockPrismaService = {
    inventory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
    },
    inventoryMovement: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('Health Status Classification', () => {
    it('should classify as OUT_OF_STOCK when available <= 0', () => {
      expect(service.classifyHealthStatus(0, 3)).toBe('OUT_OF_STOCK');
      expect(service.classifyHealthStatus(-1, 3)).toBe('OUT_OF_STOCK');
    });

    it('should classify as LOW_STOCK when 0 < available <= threshold', () => {
      expect(service.classifyHealthStatus(1, 3)).toBe('LOW_STOCK');
      expect(service.classifyHealthStatus(2, 3)).toBe('LOW_STOCK');
      expect(service.classifyHealthStatus(3, 3)).toBe('LOW_STOCK');
    });

    it('should classify as IN_STOCK when available > threshold', () => {
      expect(service.classifyHealthStatus(4, 3)).toBe('IN_STOCK');
      expect(service.classifyHealthStatus(10, 3)).toBe('IN_STOCK');
    });
  });

  describe('getInventory', () => {
    it('should return paginated inventory list and correct summary metrics', async () => {
      const items = [
        { ...mockInventory, quantityOnHand: 10, reservedQuantity: 2 }, // available: 8 -> IN_STOCK
        {
          ...mockInventory,
          id: 'inv-02',
          quantityOnHand: 3,
          reservedQuantity: 1, // available: 2 -> LOW_STOCK
        },
        {
          ...mockInventory,
          id: 'inv-03',
          quantityOnHand: 2,
          reservedQuantity: 2, // available: 0 -> OUT_OF_STOCK
        },
      ];

      mockPrismaService.inventory.findMany.mockResolvedValue(items);

      const result = await service.getInventory({ page: 1, limit: 10 });

      expect(result.data.length).toBe(3);
      expect(result.summary.totalPieces).toBe(15);
      expect(result.summary.inStockCount).toBe(1);
      expect(result.summary.lowStockCount).toBe(1);
      expect(result.summary.outOfStockCount).toBe(1);
      expect(result.meta.totalItems).toBe(3);
    });

    it('should filter by status LOW_STOCK', async () => {
      const items = [
        { ...mockInventory, quantityOnHand: 10, reservedQuantity: 2 }, // IN_STOCK
        {
          ...mockInventory,
          id: 'inv-02',
          quantityOnHand: 3,
          reservedQuantity: 1, // LOW_STOCK
        },
      ];

      mockPrismaService.inventory.findMany.mockResolvedValue(items);

      const result = await service.getInventory({
        status: InventoryStatusFilter.LOW_STOCK,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].status).toBe('LOW_STOCK');
    });
  });

  describe('getLowStockInventory', () => {
    it('should return only variants that are in low stock or out of stock', async () => {
      const items = [
        { ...mockInventory, quantityOnHand: 10, reservedQuantity: 0 }, // IN_STOCK
        { ...mockInventory, id: 'inv-02', quantityOnHand: 2, reservedQuantity: 0 }, // LOW_STOCK
        { ...mockInventory, id: 'inv-03', quantityOnHand: 0, reservedQuantity: 0 }, // OUT_OF_STOCK
      ];

      mockPrismaService.inventory.findMany.mockResolvedValue(items);

      const result = await service.getLowStockInventory();

      expect(result.length).toBe(2);
      expect(result.every((i) => i.status !== 'IN_STOCK')).toBe(true);
    });
  });

  describe('getVariantInventory', () => {
    it('should return single variant inventory detail', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue({
        ...mockVariant,
        inventory: mockInventory,
      });

      const result = await service.getVariantInventory(mockVariant.id);

      expect(result.sku).toBe('NV-JKT-001-RAW-S');
      expect(result.availableQuantity).toBe(8);
      expect(result.status).toBe('IN_STOCK');
    });

    it('should throw NotFoundException if variant does not exist', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(null);

      await expect(service.getVariantInventory('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('adjustStock (Transactional)', () => {
    it('should successfully increase stock on restock and record movement', async () => {
      const updatedMockInventory = {
        ...mockInventory,
        quantityOnHand: 20, // 10 + 10
      };

      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const tx = {
          productVariant: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockVariant,
              inventory: mockInventory,
            }),
          },
          inventory: {
            update: jest.fn().mockResolvedValue(updatedMockInventory),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue(mockMovement),
          },
        };
        return cb(tx);
      });

      const result = await service.adjustStock(
        mockVariant.id,
        {
          quantityDelta: 10,
          movementType: InventoryMovementType.restock,
          note: 'Arrived from atelier',
        },
        { id: 'admin-01', email: 'admin@novae.atelier' },
      );

      expect(result.quantityOnHand).toBe(20);
      expect(result.availableQuantity).toBe(18); // 20 - 2
    });

    it('should successfully reduce stock on negative adjustment', async () => {
      const updatedMockInventory = {
        ...mockInventory,
        quantityOnHand: 8, // 10 - 2
      };

      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const tx = {
          productVariant: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockVariant,
              inventory: mockInventory,
            }),
          },
          inventory: {
            update: jest.fn().mockResolvedValue(updatedMockInventory),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue(mockMovement),
          },
        };
        return cb(tx);
      });

      const result = await service.adjustStock(
        mockVariant.id,
        {
          quantityDelta: -2,
          movementType: InventoryMovementType.adjustment,
        },
        { id: 'admin-01', email: 'admin@novae.atelier' },
      );

      expect(result.quantityOnHand).toBe(8);
    });

    it('should reject reduction if resulting on-hand stock is negative', async () => {
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const tx = {
          productVariant: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockVariant,
              inventory: { ...mockInventory, quantityOnHand: 5, reservedQuantity: 0 },
            }),
          },
        };
        return cb(tx);
      });

      await expect(
        service.adjustStock(
          mockVariant.id,
          {
            quantityDelta: -10, // 5 - 10 = -5 < 0
          },
          { id: 'admin-01' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject reduction if resulting stock drops below reserved quantity', async () => {
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const tx = {
          productVariant: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockVariant,
              inventory: { ...mockInventory, quantityOnHand: 10, reservedQuantity: 8 },
            }),
          },
        };
        return cb(tx);
      });

      await expect(
        service.adjustStock(
          mockVariant.id,
          {
            quantityDelta: -5, // 10 - 5 = 5 < 8 reserved
          },
          { id: 'admin-01' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if variant does not exist during adjustment', async () => {
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const tx = {
          productVariant: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return cb(tx);
      });

      await expect(
        service.adjustStock(
          'non-existent-id',
          { quantityDelta: 5 },
          { id: 'admin-01' },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVariantMovements', () => {
    it('should return chronological audit movements for variant', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockPrismaService.inventoryMovement.findMany.mockResolvedValue([mockMovement]);

      const result = await service.getVariantMovements(mockVariant.id);

      expect(result.length).toBe(1);
      expect(result[0].movementType).toBe(InventoryMovementType.restock);
      expect(result[0].quantityDelta).toBe(10);
      expect(result[0].createdByName).toBe('Madame Direktris');
    });

    it('should throw NotFoundException if variant does not exist', async () => {
      mockPrismaService.productVariant.findUnique.mockResolvedValue(null);

      await expect(service.getVariantMovements('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
