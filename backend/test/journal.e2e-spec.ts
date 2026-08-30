import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/database/prisma.service';
import { ContentStatus, LanguageCode, UserRole, UserStatus } from '@prisma/client';

describe('NOVAÉ Journal CMS (e2e)', () => {
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

  const mockArticle = {
    id: '00000000-0000-0000-000a-000000000001',
    slug: 'anatomy-of-form',
    category: 'Design Philosophy',
    coverImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e',
    authorUserId: mockAdmin.id,
    readingTimeMinutes: 8,
    status: ContentStatus.published,
    featured: true,
    publishedAt: new Date('2026-08-15T10:00:00Z'),
    createdAt: new Date('2026-08-10T10:00:00Z'),
    updatedAt: new Date('2026-08-15T10:00:00Z'),
    author: {
      id: mockAdmin.id,
      fullName: mockAdmin.fullName,
      email: mockAdmin.email,
    },
    translations: [
      {
        id: 't-1',
        articleId: '00000000-0000-0000-000a-000000000001',
        language: LanguageCode.id,
        title: 'Anatomi dari Form',
        excerpt: 'Mengeksplorasi prinsip arsitektural...',
        content: 'Koleksi FORM terinspirasi dari arsitektur brutalis...',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 't-2',
        articleId: '00000000-0000-0000-000a-000000000001',
        language: LanguageCode.en,
        title: 'The Anatomy of Form',
        excerpt: 'Exploring the architectural principles...',
        content: 'The FORM collection draws from brutalist architecture...',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn((args: any) => {
        if (args.where.id === mockAdmin.id || args.where.email === mockAdmin.email) {
          return Promise.resolve(mockAdmin);
        }
        if (args.where.id === mockCustomer.id || args.where.email === mockCustomer.email) {
          return Promise.resolve(mockCustomer);
        }
        return Promise.resolve(null);
      }),
    },
    article: {
      findMany: jest.fn().mockResolvedValue([mockArticle]),
      findUnique: jest.fn((args: any) => {
        if (args.where.slug === 'anatomy-of-form' || args.where.id === mockArticle.id) {
          return Promise.resolve(mockArticle);
        }
        return Promise.resolve(null);
      }),
      findFirst: jest.fn((args: any) => {
        if (args.where.slug === 'anatomy-of-form' || args.where.id === mockArticle.id) {
          return Promise.resolve(mockArticle);
        }
        return Promise.resolve(null);
      }),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue(mockArticle),
      update: jest.fn().mockResolvedValue(mockArticle),
      delete: jest.fn().mockResolvedValue(mockArticle),
    },
    articleTranslation: {
      create: jest.fn().mockResolvedValue(mockArticle.translations[0]),
      upsert: jest.fn().mockResolvedValue(mockArticle.translations[0]),
    },
    $transaction: jest.fn(async (cb: any) => cb(mockPrisma)),
  };

  beforeAll(async () => {
    process.env.SUPABASE_JWT_SECRET = jwtSecret;

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
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /api/v1/articles (Public)', () => {
    it('should return published articles list with 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/articles?lang=en')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].slug).toBe('anatomy-of-form');
      expect(res.body.data[0].title).toBe('The Anatomy of Form');
    });
  });

  describe('GET /api/v1/articles/:slug (Public)', () => {
    it('should return article detail by slug', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/articles/anatomy-of-form?lang=id')
        .expect(200);

      expect(res.body.slug).toBe('anatomy-of-form');
      expect(res.body.title).toBe('Anatomi dari Form');
      expect(res.body.content).toContain('Koleksi FORM');
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/articles/non-existent-story')
        .expect(404);
    });
  });

  describe('GET /api/v1/admin/articles (Admin)', () => {
    it('should reject unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/articles')
        .expect(401);
    });

    it('should reject customer token with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/articles')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should allow admin token with 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data[0].translations).toHaveLength(2);
    });
  });

  describe('POST /api/v1/admin/articles (Admin)', () => {
    it('should successfully create a new article with translations', async () => {
      mockPrisma.article.findUnique.mockResolvedValueOnce(null); // uniqueness check

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'crafting-the-identity',
          category: 'Craftsmanship',
          coverImageUrl: 'https://example.com/craft.jpg',
          readingTimeMinutes: 6,
          status: 'draft',
          translations: [
            {
              language: 'id',
              title: 'Membangun Identitas',
              excerpt: 'Ringkasan singkat...',
              content: 'Isi lengkap artikel crafting...',
            },
          ],
        })
        .expect(201);

      expect(res.body).toBeDefined();
    });
  });

  describe('PATCH /api/v1/admin/articles/:id (Admin)', () => {
    it('should update article metadata', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/articles/${mockArticle.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          category: 'Updated Category',
        })
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('POST /api/v1/admin/articles/:id/publish (Admin)', () => {
    it('should transition article to published', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/articles/${mockArticle.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('POST /api/v1/admin/articles/:id/archive (Admin)', () => {
    it('should transition article to archived', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/articles/${mockArticle.id}/archive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /api/v1/admin/articles/:id (Admin)', () => {
    it('should soft-delete or delete article', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/admin/articles/${mockArticle.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
