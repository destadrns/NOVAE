import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ContentStatus, LanguageCode, User } from '@prisma/client';
import {
  GetArticlesQueryDto,
  AdminArticlesQueryDto,
} from './dto/get-articles-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  ArticleListItemDto,
  ArticleDetailDto,
  AdminArticleDetailDto,
  PaginatedArticlesDto,
} from './dto/article-response.dto';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve localized translation for an article with Indonesian fallback
   */
  private resolveTranslation(
    translations: any[] = [],
    preferredLang: LanguageCode = LanguageCode.id,
  ) {
    const direct = translations.find((t) => t.language === preferredLang);
    if (direct) return direct;

    const indonesian = translations.find((t) => t.language === LanguageCode.id);
    if (indonesian) return indonesian;

    const english = translations.find((t) => t.language === LanguageCode.en);
    if (english) return english;

    return translations[0] || { title: 'Untitled', excerpt: '', content: '' };
  }

  /**
   * Format article to customer-facing list item
   */
  private formatArticleListItem(
    article: any,
    lang: LanguageCode = LanguageCode.id,
  ): ArticleListItemDto {
    const t = this.resolveTranslation(article.translations, lang);
    return {
      id: article.id,
      slug: article.slug,
      category: article.category,
      coverImageUrl: article.coverImageUrl,
      author: article.author?.fullName || 'NOVAÉ Atelier Editorial',
      readingTimeMinutes: article.readingTimeMinutes,
      status: article.status,
      featured: article.featured,
      title: t.title,
      excerpt: t.excerpt,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
    };
  }

  /**
   * Format article to customer-facing detail item
   */
  private formatArticleDetail(
    article: any,
    lang: LanguageCode = LanguageCode.id,
  ): ArticleDetailDto {
    const t = this.resolveTranslation(article.translations, lang);
    return {
      id: article.id,
      slug: article.slug,
      category: article.category,
      coverImageUrl: article.coverImageUrl,
      author: article.author?.fullName || 'NOVAÉ Atelier Editorial',
      readingTimeMinutes: article.readingTimeMinutes,
      status: article.status,
      featured: article.featured,
      title: t.title,
      excerpt: t.excerpt,
      content: t.content,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
    };
  }

  /**
   * Format article for admin CMS view
   */
  private formatAdminArticle(article: any): AdminArticleDetailDto {
    const defaultTranslation = this.resolveTranslation(article.translations, LanguageCode.id);
    return {
      id: article.id,
      slug: article.slug,
      category: article.category,
      coverImageUrl: article.coverImageUrl,
      author: article.author?.fullName || 'NOVAÉ Atelier Editorial',
      authorUserId: article.authorUserId,
      readingTimeMinutes: article.readingTimeMinutes,
      status: article.status,
      featured: article.featured,
      title: defaultTranslation.title,
      excerpt: defaultTranslation.excerpt,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      translations: (article.translations || []).map((t: any) => ({
        language: t.language,
        title: t.title,
        excerpt: t.excerpt,
        content: t.content,
      })),
    };
  }

  // ==================================================================
  // PUBLIC JOURNAL ENDPOINTS
  // ==================================================================

  /**
   * Public: List all published journal articles
   */
  async getPublishedArticles(query: GetArticlesQueryDto): Promise<PaginatedArticlesDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;
    const lang = query.lang || LanguageCode.id;

    const where: any = {
      status: ContentStatus.published,
    };

    if (query.category) {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { slug: { contains: s, mode: 'insensitive' } },
        { category: { contains: s, mode: 'insensitive' } },
        {
          translations: {
            some: {
              OR: [
                { title: { contains: s, mode: 'insensitive' } },
                { excerpt: { contains: s, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const [articles, totalItems] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          translations: true,
          author: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    const data = articles.map((art) => this.formatArticleListItem(art, lang));

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * Public: Get published article by slug
   */
  async getPublishedArticleBySlug(
    slug: string,
    lang: LanguageCode = LanguageCode.id,
  ): Promise<ArticleDetailDto> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        translations: true,
        author: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!article || article.status !== ContentStatus.published) {
      throw new NotFoundException(`Journal article with slug "${slug}" was not found`);
    }

    return this.formatArticleDetail(article, lang);
  }

  // ==================================================================
  // ADMIN CMS ENDPOINTS
  // ==================================================================

  /**
   * Admin: List all articles with status filtering and search
   */
  async getAdminArticles(query: AdminArticlesQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status.toLowerCase() as ContentStatus;
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { slug: { contains: s, mode: 'insensitive' } },
        { category: { contains: s, mode: 'insensitive' } },
        {
          translations: {
            some: {
              OR: [
                { title: { contains: s, mode: 'insensitive' } },
                { excerpt: { contains: s, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const [articles, totalItems] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          translations: true,
          author: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    const data = articles.map((art) => this.formatAdminArticle(art));

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * Admin: Get article by ID or slug with all translation fields
   */
  async getAdminArticleById(id: string): Promise<AdminArticleDetailDto> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const article = await this.prisma.article.findFirst({
      where: isUuid ? { id } : { slug: id },
      include: {
        translations: true,
        author: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article "${id}" not found`);
    }

    return this.formatAdminArticle(article);
  }

  /**
   * Admin: Create article with bilingual translations
   */
  async createArticle(dto: CreateArticleDto, adminUser: User): Promise<AdminArticleDetailDto> {
    // Check slug uniqueness
    const existing = await this.prisma.article.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Article with slug "${dto.slug}" already exists`);
    }

    const status = dto.status || ContentStatus.draft;
    const publishedAt = status === ContentStatus.published ? new Date() : null;

    const created = await this.prisma.$transaction(async (tx) => {
      const art = await tx.article.create({
        data: {
          slug: dto.slug,
          category: dto.category,
          coverImageUrl: dto.coverImageUrl || null,
          authorUserId: dto.authorUserId || adminUser.id,
          readingTimeMinutes: dto.readingTimeMinutes || 5,
          status,
          featured: dto.featured || false,
          publishedAt,
        },
      });

      if (dto.translations && dto.translations.length > 0) {
        for (const tr of dto.translations) {
          await tx.articleTranslation.create({
            data: {
              articleId: art.id,
              language: tr.language,
              title: tr.title,
              excerpt: tr.excerpt || null,
              content: tr.content,
            },
          });
        }
      }

      return tx.article.findUnique({
        where: { id: art.id },
        include: {
          translations: true,
          author: { select: { id: true, fullName: true, email: true } },
        },
      });
    });

    this.logger.log(`Created journal article "${created?.slug}" (Admin: ${adminUser.email})`);
    return this.formatAdminArticle(created);
  }

  /**
   * Admin: Update article and translations
   */
  async updateArticle(
    id: string,
    dto: UpdateArticleDto,
    adminUser: User,
  ): Promise<AdminArticleDetailDto> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const article = await this.prisma.article.findFirst({
      where: isUuid ? { id } : { slug: id },
    });

    if (!article) {
      throw new NotFoundException(`Article "${id}" not found`);
    }

    // If slug is changing, verify uniqueness
    if (dto.slug && dto.slug !== article.slug) {
      const existingSlug = await this.prisma.article.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug && existingSlug.id !== article.id) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken by another article`);
      }
    }

    const updateData: any = {};
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.coverImageUrl !== undefined) updateData.coverImageUrl = dto.coverImageUrl;
    if (dto.readingTimeMinutes !== undefined) updateData.readingTimeMinutes = dto.readingTimeMinutes;
    if (dto.featured !== undefined) updateData.featured = dto.featured;
    if (dto.authorUserId !== undefined) updateData.authorUserId = dto.authorUserId;

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === ContentStatus.published && !article.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.article.update({
        where: { id: article.id },
        data: updateData,
      });

      if (dto.translations && dto.translations.length > 0) {
        for (const tr of dto.translations) {
          await tx.articleTranslation.upsert({
            where: {
              articleId_language: {
                articleId: article.id,
                language: tr.language,
              },
            },
            create: {
              articleId: article.id,
              language: tr.language,
              title: tr.title,
              excerpt: tr.excerpt || null,
              content: tr.content,
            },
            update: {
              title: tr.title,
              excerpt: tr.excerpt || null,
              content: tr.content,
            },
          });
        }
      }

      return tx.article.findUnique({
        where: { id: article.id },
        include: {
          translations: true,
          author: { select: { id: true, fullName: true, email: true } },
        },
      });
    });

    this.logger.log(`Updated journal article "${updated?.slug}" (Admin: ${adminUser.email})`);
    return this.formatAdminArticle(updated);
  }

  /**
   * Admin: Publish article
   */
  async publishArticle(id: string, adminUser: User): Promise<AdminArticleDetailDto> {
    return this.updateArticle(
      id,
      { status: ContentStatus.published, publishedAt: new Date() as any },
      adminUser,
    );
  }

  /**
   * Admin: Archive article
   */
  async archiveArticle(id: string, adminUser: User): Promise<AdminArticleDetailDto> {
    return this.updateArticle(id, { status: ContentStatus.archived }, adminUser);
  }

  /**
   * Admin: Delete or archive article
   */
  async deleteArticle(id: string, adminUser: User): Promise<{ success: boolean; message: string }> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const article = await this.prisma.article.findFirst({
      where: isUuid ? { id } : { slug: id },
    });

    if (!article) {
      throw new NotFoundException(`Article "${id}" not found`);
    }

    // If already published historically, soft-delete into archived status to preserve audit trail
    if (article.status === ContentStatus.published || article.publishedAt) {
      await this.prisma.article.update({
        where: { id: article.id },
        data: { status: ContentStatus.archived },
      });
      this.logger.log(`Soft-deleted (archived) historical article "${article.slug}" (Admin: ${adminUser.email})`);
      return {
        success: true,
        message: `Historical article "${article.slug}" has been archived to preserve content integrity.`,
      };
    }

    // Otherwise if it's draft, delete record cleanly
    await this.prisma.article.delete({
      where: { id: article.id },
    });

    this.logger.log(`Deleted draft article "${article.slug}" (Admin: ${adminUser.email})`);
    return {
      success: true,
      message: `Draft article "${article.slug}" has been permanently removed.`,
    };
  }
}
