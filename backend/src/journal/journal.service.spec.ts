import { Test, TestingModule } from '@nestjs/testing';
import { JournalService } from './journal.service';
import { PrismaService } from '../database/prisma.service';
import { ContentStatus, LanguageCode, UserRole } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('JournalService', () => {
  let service: JournalService;
  let prisma: any;

  const mockAdminUser: any = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@novae.atelier',
    fullName: 'NOVAÉ Atelier Admin',
    role: UserRole.admin,
  };

  const mockArticle: any = {
    id: 'art-1',
    slug: 'anatomy-of-form',
    category: 'Design Philosophy',
    coverImageUrl: 'https://example.com/cover.jpg',
    authorUserId: mockAdminUser.id,
    readingTimeMinutes: 8,
    status: ContentStatus.published,
    featured: true,
    publishedAt: new Date('2026-08-15T10:00:00Z'),
    createdAt: new Date('2026-08-10T10:00:00Z'),
    updatedAt: new Date('2026-08-15T10:00:00Z'),
    author: {
      id: mockAdminUser.id,
      fullName: mockAdminUser.fullName,
      email: mockAdminUser.email,
    },
    translations: [
      {
        id: 'tr-1',
        articleId: 'art-1',
        language: LanguageCode.en,
        title: 'The Anatomy of Form',
        excerpt: 'Exploring the architectural principles...',
        content: 'The FORM collection draws from brutalist architecture...',
      },
      {
        id: 'tr-2',
        articleId: 'art-1',
        language: LanguageCode.id,
        title: 'Anatomi dari Form',
        excerpt: 'Mengeksplorasi prinsip arsitektural...',
        content: 'Koleksi FORM terinspirasi dari arsitektur brutalis...',
      },
    ],
  };

  const mockPrisma = {
    article: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    articleTranslation: {
      create: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<JournalService>(JournalService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getPublishedArticles', () => {
    it('should return published articles with preferred language translation', async () => {
      prisma.article.findMany.mockResolvedValue([mockArticle]);
      prisma.article.count.mockResolvedValue(1);

      const result = await service.getPublishedArticles({ lang: LanguageCode.en });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('The Anatomy of Form');
      expect(result.data[0].status).toBe(ContentStatus.published);
      expect(result.meta.totalItems).toBe(1);
      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ContentStatus.published }),
        }),
      );
    });

    it('should fallback to Indonesian when translation is missing', async () => {
      const articleOnlyId = {
        ...mockArticle,
        translations: [mockArticle.translations[1]], // only ID translation
      };
      prisma.article.findMany.mockResolvedValue([articleOnlyId]);
      prisma.article.count.mockResolvedValue(1);

      const result = await service.getPublishedArticles({ lang: LanguageCode.en });

      expect(result.data[0].title).toBe('Anatomi dari Form');
    });
  });

  describe('getPublishedArticleBySlug', () => {
    it('should return published article details by slug', async () => {
      prisma.article.findUnique.mockResolvedValue(mockArticle);

      const result = await service.getPublishedArticleBySlug('anatomy-of-form', LanguageCode.id);

      expect(result.slug).toBe('anatomy-of-form');
      expect(result.title).toBe('Anatomi dari Form');
      expect(result.content).toContain('Koleksi FORM');
    });

    it('should throw NotFoundException if article is draft or does not exist', async () => {
      prisma.article.findUnique.mockResolvedValue({
        ...mockArticle,
        status: ContentStatus.draft,
      });

      await expect(
        service.getPublishedArticleBySlug('anatomy-of-form', LanguageCode.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAdminArticles', () => {
    it('should return all articles with filters for admin', async () => {
      prisma.article.findMany.mockResolvedValue([mockArticle]);
      prisma.article.count.mockResolvedValue(1);

      const result = await service.getAdminArticles({ status: 'ALL' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].translations).toHaveLength(2);
    });
  });

  describe('getAdminArticleById', () => {
    it('should return full article detail with raw translations', async () => {
      prisma.article.findFirst.mockResolvedValue(mockArticle);

      const result = await service.getAdminArticleById('art-1');

      expect(result.id).toBe('art-1');
      expect(result.translations).toHaveLength(2);
    });

    it('should throw NotFoundException if article not found', async () => {
      prisma.article.findFirst.mockResolvedValue(null);

      await expect(service.getAdminArticleById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createArticle', () => {
    it('should create article with translations in transaction', async () => {
      prisma.article.findUnique.mockResolvedValueOnce(null); // uniqueness check
      prisma.article.create.mockResolvedValue({ id: 'art-2', slug: 'new-article' });
      prisma.article.findUnique.mockResolvedValueOnce({
        id: 'art-2',
        slug: 'new-article',
        category: 'Craft',
        status: ContentStatus.draft,
        translations: [
          {
            language: LanguageCode.id,
            title: 'Artikel Baru',
            content: 'Isi artikel...',
          },
        ],
      });

      const result = await service.createArticle(
        {
          slug: 'new-article',
          category: 'Craft',
          translations: [
            {
              language: LanguageCode.id,
              title: 'Artikel Baru',
              content: 'Isi artikel...',
            },
          ],
        },
        mockAdminUser,
      );

      expect(result.slug).toBe('new-article');
      expect(prisma.article.create).toHaveBeenCalled();
      expect(prisma.articleTranslation.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate slug', async () => {
      prisma.article.findUnique.mockResolvedValueOnce(mockArticle);

      await expect(
        service.createArticle(
          {
            slug: 'anatomy-of-form',
            category: 'Craft',
            translations: [],
          },
          mockAdminUser,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteArticle', () => {
    it('should soft-delete (archive) published article', async () => {
      prisma.article.findFirst.mockResolvedValue(mockArticle);

      const result = await service.deleteArticle('art-1', mockAdminUser);

      expect(result.success).toBe(true);
      expect(prisma.article.update).toHaveBeenCalledWith({
        where: { id: 'art-1' },
        data: { status: ContentStatus.archived },
      });
      expect(prisma.article.delete).not.toHaveBeenCalled();
    });

    it('should hard-delete draft article', async () => {
      prisma.article.findFirst.mockResolvedValue({
        ...mockArticle,
        status: ContentStatus.draft,
        publishedAt: null,
      });

      const result = await service.deleteArticle('art-1', mockAdminUser);

      expect(result.success).toBe(true);
      expect(prisma.article.delete).toHaveBeenCalledWith({
        where: { id: 'art-1' },
      });
    });
  });
});
