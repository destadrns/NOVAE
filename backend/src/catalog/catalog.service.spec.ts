import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../database/prisma.service';
import { LanguageCode, ProductStatus, VariantStatus } from '@prisma/client';
import { ProductSortOption } from './dto/get-products-query.dto';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: PrismaService;

  const mockCategories = [
    {
      id: 'cat-01',
      slug: 'outerwear',
      name: 'Outerwear',
      description: 'Jackets and coats',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'cat-02',
      slug: 'tops',
      name: 'Tops',
      description: 'Shirts and knits',
      isActive: true,
      sortOrder: 2,
    },
  ];

  const mockCollections = [
    {
      id: 'col-01',
      code: 'FORM',
      slug: 'form',
      name: 'FORM — Chapter 01',
      description: 'Architectural geometry',
      coverImageUrl: 'https://images.unsplash.com/col1',
      status: 'published',
      sortOrder: 1,
      translations: [
        {
          id: 'ct-01',
          collectionId: 'col-01',
          language: LanguageCode.id,
          name: 'FORM — Chapter 01 (ID)',
          description: 'Eksplorasi siluet terstruktur',
        },
        {
          id: 'ct-02',
          collectionId: 'col-01',
          language: LanguageCode.en,
          name: 'FORM — Chapter 01 (EN)',
          description: 'Exploration of structured silhouettes',
        },
      ],
    },
  ];

  const mockProduct = {
    id: 'prod-01',
    skuRoot: 'NV-JKT-001',
    slug: 'oversized-form-jacket',
    categoryId: 'cat-01',
    collectionId: 'col-01',
    basePriceIdr: BigInt(1850000),
    status: ProductStatus.active,
    featured: true,
    isNewDrop: true,
    limitedRun: false,
    featuredRank: 1,
    primaryImageUrl: 'https://images.unsplash.com/jkt1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    category: {
      id: 'cat-01',
      slug: 'outerwear',
      name: 'Outerwear',
    },
    collection: {
      id: 'col-01',
      code: 'FORM',
      slug: 'form',
      name: 'FORM — Chapter 01',
      translations: [
        {
          id: 'ct-01',
          collectionId: 'col-01',
          language: LanguageCode.id,
          name: 'FORM — Chapter 01',
        },
      ],
    },
    translations: [
      {
        id: 'pt-01',
        productId: 'prod-01',
        language: LanguageCode.id,
        name: 'Oversized Form Jacket (ID)',
        shortDescription: 'Jaket struktural bervolume lebar.',
        description: 'Deskripsi lengkap bahasa Indonesia.',
        materialDescription: '14oz Raw Denim.',
        provenanceText: 'Dibuat di Bandung.',
      },
      {
        id: 'pt-02',
        productId: 'prod-01',
        language: LanguageCode.en,
        name: 'Oversized Form Jacket (EN)',
        shortDescription: 'Wide structured jacket in raw denim.',
        description: 'Full English product description.',
        materialDescription: '14oz Kurabo Raw Denim.',
        provenanceText: 'Handcrafted in Bandung atelier.',
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
        imageUrl: 'https://images.unsplash.com/jkt1',
        createdAt: new Date('2026-01-01'),
        inventory: {
          id: 'inv-01',
          variantId: 'var-01',
          quantityOnHand: 6,
          reservedQuantity: 0,
        },
      },
      {
        id: 'var-02',
        productId: 'prod-01',
        sku: 'NV-JKT-001-RAW-M',
        colorName: 'Raw Indigo',
        colorCode: '#1C2333',
        size: 'M',
        priceOverrideIdr: null,
        status: VariantStatus.active,
        imageUrl: 'https://images.unsplash.com/jkt1',
        createdAt: new Date('2026-01-01'),
        inventory: {
          id: 'inv-02',
          variantId: 'var-02',
          quantityOnHand: 0,
          reservedQuantity: 0,
        },
      },
    ],
    images: [
      {
        id: 'img-01',
        productId: 'prod-01',
        variantId: null,
        imageUrl: 'https://images.unsplash.com/jkt1',
        altText: 'Front Atelier Shot',
        sortOrder: 0,
        isPrimary: true,
      },
    ],
    tagMaps: [
      {
        productId: 'prod-01',
        tagId: 'tag-01',
        tag: { id: 'tag-01', name: 'Oversized' },
      },
      {
        productId: 'prod-01',
        tagId: 'tag-02',
        tag: { id: 'tag-02', name: 'Denim' },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: PrismaService,
          useValue: {
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
              count: jest.fn().mockResolvedValue(1),
              findMany: jest.fn().mockResolvedValue([mockProduct]),
              findFirst: jest.fn().mockImplementation(({ where }) => {
                if (where.slug === mockProduct.slug) {
                  return Promise.resolve(mockProduct);
                }
                return Promise.resolve(null);
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return all active categories in sort order', async () => {
      const result = await service.getCategories();
      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('outerwear');
      expect(result[1].slug).toBe('tops');
    });
  });

  describe('getCollections', () => {
    it('should return published collections with requested language localization', async () => {
      const resultEn = await service.getCollections(LanguageCode.en);
      expect(resultEn).toHaveLength(1);
      expect(resultEn[0].name).toBe('FORM — Chapter 01 (EN)');

      const resultId = await service.getCollections(LanguageCode.id);
      expect(resultId[0].name).toBe('FORM — Chapter 01 (ID)');
    });
  });

  describe('getCollectionBySlug', () => {
    it('should return collection detail for valid slug', async () => {
      const result = await service.getCollectionBySlug('form', LanguageCode.en);
      expect(result.slug).toBe('form');
      expect(result.code).toBe('FORM');
      expect(result.name).toBe('FORM — Chapter 01 (EN)');
    });

    it('should throw NotFoundException on non-existent collection slug', async () => {
      await expect(service.getCollectionBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProducts', () => {
    it('should return paginated products list with metadata', async () => {
      const result = await service.getProducts({ page: 1, limit: 12 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(12);
      expect(result.data[0].slug).toBe('oversized-form-jacket');
      expect(result.data[0].basePriceIdr).toBe(1850000);
      expect(result.data[0].inStock).toBe(true);
      expect(result.data[0].colors).toEqual([{ name: 'Raw Indigo', code: '#1C2333' }]);
      expect(result.data[0].sizes).toEqual(['S', 'M']);
      expect(result.data[0].tags).toEqual(['Oversized', 'Denim']);
    });

    it('should correctly localize product list item in English', async () => {
      const result = await service.getProducts({ language: LanguageCode.en });
      expect(result.data[0].name).toBe('Oversized Form Jacket (EN)');
      expect(result.data[0].shortDescription).toBe('Wide structured jacket in raw denim.');
    });

    it('should construct filters for category, price, and search', async () => {
      await service.getProducts({
        category: 'outerwear',
        collection: 'form',
        minPrice: 1000000,
        maxPrice: 2000000,
        size: 'S',
        color: 'Indigo',
        tags: 'Oversized,Denim',
        search: 'jacket',
        sort: ProductSortOption.PRICE_ASC,
      });

      expect(prisma.product.findMany).toHaveBeenCalled();
    });
  });

  describe('getProductBySlug', () => {
    it('should return complete localized product detail with customer-safe variants', async () => {
      const result = await service.getProductBySlug('oversized-form-jacket', LanguageCode.en);

      expect(result.id).toBe('prod-01');
      expect(result.name).toBe('Oversized Form Jacket (EN)');
      expect(result.category.slug).toBe('outerwear');
      expect(result.collection?.code).toBe('FORM');
      expect(result.isPurchasable).toBe(true);
      expect(result.images).toHaveLength(1);
      expect(result.variants).toHaveLength(2);

      // Verify safe stock projection
      expect(result.variants[0].sku).toBe('NV-JKT-001-RAW-S');
      expect(result.variants[0].inStock).toBe(true);
      expect(result.variants[0].availableQuantity).toBe(6);
      expect(result.variants[1].inStock).toBe(false);
      expect(result.variants[1].availableQuantity).toBe(0);

      // Verify no internal fields leaked
      expect((result.variants[0] as any).reservedQuantity).toBeUndefined();
      expect((result.variants[0] as any).inventoryMovements).toBeUndefined();
    });

    it('should throw NotFoundException on non-existent product slug', async () => {
      await expect(service.getProductBySlug('unknown-slug')).rejects.toThrow(NotFoundException);
    });
  });
});
