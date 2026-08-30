import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LanguageCode } from '@prisma/client';
import { JournalService } from './journal.service';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import {
  ArticleDetailDto,
  PaginatedArticlesDto,
} from './dto/article-response.dto';

@ApiTags('Journal (Public)')
@Controller('articles')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @ApiOperation({
    summary: 'List published journal articles',
    description: 'Returns paginated published articles with localized titles and excerpts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated published journal articles',
    type: PaginatedArticlesDto,
  })
  async getPublishedArticles(
    @Query() query: GetArticlesQueryDto,
  ): Promise<PaginatedArticlesDto> {
    return this.journalService.getPublishedArticles(query);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get published journal article by slug',
    description: 'Returns full article content and metadata in requested language.',
  })
  @ApiParam({ name: 'slug', description: 'Article unique URL slug (e.g. anatomy-of-form)' })
  @ApiQuery({ name: 'lang', enum: LanguageCode, required: false, description: 'Language code (default: id)' })
  @ApiResponse({
    status: 200,
    description: 'Article detail content',
    type: ArticleDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found or not published' })
  async getPublishedArticleBySlug(
    @Param('slug') slug: string,
    @Query('lang') lang?: LanguageCode,
  ): Promise<ArticleDetailDto> {
    return this.journalService.getPublishedArticleBySlug(slug, lang);
  }
}
