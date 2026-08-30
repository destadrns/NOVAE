import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';
import { JournalService } from './journal.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminArticlesQueryDto } from './dto/get-articles-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AdminArticleDetailDto } from './dto/article-response.dto';

@ApiTags('Admin Journal (Protected)')
@ApiBearerAuth()
@Controller('admin/articles')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminJournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @ApiOperation({
    summary: 'List all articles for admin CMS management',
    description: 'Returns all articles with status filtering, search, and metadata.',
  })
  @ApiResponse({ status: 200, description: 'List of articles for admin' })
  async getAdminArticles(@Query() query: AdminArticlesQueryDto) {
    return this.journalService.getAdminArticles(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new journal article with bilingual translations',
  })
  @ApiResponse({ status: 201, description: 'Article created successfully', type: AdminArticleDetailDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Slug conflict' })
  async createArticle(
    @CurrentUser() user: User,
    @Body() dto: CreateArticleDto,
  ): Promise<AdminArticleDetailDto> {
    return this.journalService.createArticle(dto, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get full article details with all raw translations for editing',
  })
  @ApiParam({ name: 'id', description: 'Article UUID or slug' })
  @ApiResponse({ status: 200, description: 'Article details', type: AdminArticleDetailDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getAdminArticleById(@Param('id') id: string): Promise<AdminArticleDetailDto> {
    return this.journalService.getAdminArticleById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update journal article metadata and translations',
  })
  @ApiParam({ name: 'id', description: 'Article UUID or slug' })
  @ApiResponse({ status: 200, description: 'Article updated successfully', type: AdminArticleDetailDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 409, description: 'Slug conflict' })
  async updateArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<AdminArticleDetailDto> {
    return this.journalService.updateArticle(id, dto, user);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish draft or archived article',
  })
  @ApiParam({ name: 'id', description: 'Article UUID or slug' })
  @ApiResponse({ status: 200, description: 'Article published successfully' })
  async publishArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<AdminArticleDetailDto> {
    return this.journalService.publishArticle(id, user);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive published article',
  })
  @ApiParam({ name: 'id', description: 'Article UUID or slug' })
  @ApiResponse({ status: 200, description: 'Article archived successfully' })
  async archiveArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<AdminArticleDetailDto> {
    return this.journalService.archiveArticle(id, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete draft article or archive historical published article',
  })
  @ApiParam({ name: 'id', description: 'Article UUID or slug' })
  @ApiResponse({ status: 200, description: 'Article removed or archived' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async deleteArticle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.journalService.deleteArticle(id, user);
  }
}
