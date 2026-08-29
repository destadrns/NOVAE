import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminCatalogService } from './admin-catalog.service';
import { PrismaService } from '../database/prisma.service';
import { LanguageCode, ProductStatus, VariantStatus } from '@prisma/client';

describe('AdminCatalogService', () => {
  let service: AdminCatalogService;
  let prisma: PrismaService;

  const mockCategory = {
    id: '00000000-0000-0000-0002-000000000001',
    slug: 'outerwear',
    name: 'Outerwear',
  };

  const mockProduct = {
    id: 'prod-01',
    skuRoot: 'NV-JKT-001',
    slug: 'oversized-form-jacket',
    categoryId: '00000000-0000-0000-0002-000000000001',
    collectionId: null,
    basePriceIdr: BigInt(1850000),
    status: ProductStatus.draft,
    featured: false,
    isNewDrop: false,
    limitedRun: false,
    featuredRank: null,
    primaryImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategory,
    collection: null,
    translations: [
      {
        id: 't-01',
        productId: 'prod-01',
        language: LanguageCode.id,
        name: 'Oversized Form Jacket (ID)',
        shortDescription: null,
        description: null,
        materialDescription: null,
        provenanceText: null,
      },
    ],
    variants: [
      {
        id: 'var-01',
        productId: 'prod-01',
        sku: 'NV-JKT-001-RAW-S',
        colorName: 'Raw Indigo',
        colorCode: '#1C2333',
        size: 'S',
        priceOverrideIdr: null,
        status: VariantStatus.active,
        imageUrl: null,
        inventory: { quantityOnHand: 5, reservedQuantity: 0 },
      },
    ],
    tagMaps: [],
    images: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCatalogService,
        {
          provide: PrismaService,
          useValue: {
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
              }),
            ),
            category: {
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === mockCategory.id) return Promise.resolve(mockCategory);
                return Promise.resolve(null);
              }),
            },
            collection: {
              findUnique: jest.fn().mockResolvedValue(null),
              findMany: jest.fn().mockResolvedValue([]),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            product: {
              count: jest.fn().mockResolvedValue(1),
              findMany: jest.fn().mockResolvedValue([mockProduct]),
              findFirst: jest.fn().mockImplementation(({ where }) => {
                if (where.skuRoot === 'NV-EXISTING' || where.slug === 'existing-slug') {
                  return Promise.resolve(mockProduct);
                }
                if (where.OR && Array.isArray(where.OR)) {
                  const match = where.OR.some(
                    (o: any) => o.skuRoot === 'NV-EXISTING' || o.slug === 'existing-slug',
                  );
                  if (match) return Promise.resolve(mockProduct);
                }
                return Promise.resolve(null);
              }),
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.id === 'prod-01') return Promise.resolve(mockProduct);
                return Promise.resolve(null);
              }),
              update: jest.fn().mockResolvedValue({ ...mockProduct, status: ProductStatus.archived }),
            },
            productVariant: {
              findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.sku === 'NV-EXISTING-SKU') return Promise.resolve(mockProduct.variants[0]);
                if (where.id === 'var-01') return Promise.resolve(mockProduct.variants[0]);
                return Promise.resolve(null);
              }),
              delete: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminCatalogService>(AdminCatalogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdminProducts', () => {
    it('should return paginated admin product list with inventory summaries', async () => {
      const result = await service.getAdminProducts({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].skuRoot).toBe('NV-JKT-001');
      expect(result.data[0].totalStock).toBe(5);
      expect(result.data[0].variantsCount).toBe(1);
    });
  });

  describe('createProduct', () => {
    it('should create product, translations, and initial variants inside a transaction', async () => {
      const result = await service.createProduct({
        skuRoot: 'NV-NEW-001',
        slug: 'new-product-slug',
        categoryId: mockCategory.id,
        basePriceIdr: 1500000,
        translations: [
          {
            language: LanguageCode.id,
            name: 'New Product (ID)',
          },
        ],
        variants: [
          {
            sku: 'NV-NEW-001-BLK-S',
            colorName: 'Black',
            size: 'S',
            initialStock: 10,
          },
        ],
      });

      expect(result).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate SKU root or slug', async () => {
      await expect(
        service.createProduct({
          skuRoot: 'NV-EXISTING',
          slug: 'some-slug',
          categoryId: mockCategory.id,
          basePriceIdr: 1000000,
          translations: [{ language: LanguageCode.id, name: 'Test' }],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on invalid categoryId', async () => {
      await expect(
        service.createProduct({
          skuRoot: 'NV-NEW-002',
          slug: 'new-slug-2',
          categoryId: 'invalid-cat-uuid',
          basePriceIdr: 1000000,
          translations: [{ language: LanguageCode.id, name: 'Test' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('archiveProduct', () => {
    it('should archive existing product and update status to archived', async () => {
      const result = await service.archiveProduct('prod-01');
      expect(result.status).toBe(ProductStatus.archived);
    });

    it('should throw NotFoundException on non-existent product ID', async () => {
      await expect(service.archiveProduct('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createVariant', () => {
    it('should create variant and initialize inventory record', async () => {
      const result = await service.createVariant('prod-01', {
        sku: 'NV-JKT-001-NEW-L',
        colorName: 'Midnight Navy',
        size: 'L',
        initialStock: 8,
      });

      expect(result).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate variant SKU', async () => {
      await expect(
        service.createVariant('prod-01', {
          sku: 'NV-EXISTING-SKU',
          colorName: 'Different Color',
          size: 'M',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteVariant', () => {
    it('should delete variant if not tied to orders', async () => {
      const result = await service.deleteVariant('var-01');
      expect(result.message).toContain('deleted successfully');
    });
  });
});
