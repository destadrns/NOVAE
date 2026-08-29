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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminCatalogService } from './admin-catalog.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateProductDto } from './dto/admin/create-product.dto';
import { UpdateProductDto } from './dto/admin/update-product.dto';
import { CreateVariantDto } from './dto/admin/create-variant.dto';
import { UpdateVariantDto } from './dto/admin/update-variant.dto';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/admin/create-collection.dto';
import { AdminProductsQueryDto } from './dto/admin/admin-products-query.dto';

@ApiTags('Admin Catalog (Protected)')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminCatalogController {
  constructor(private readonly adminCatalogService: AdminCatalogService) {}

  // ------------------------------------------------------------
  // PRODUCTS CRUD
  // ------------------------------------------------------------
  @Get('products')
  @ApiOperation({
    summary: 'List all products with full admin metadata and stock counts',
  })
  async getProducts(@Query() query: AdminProductsQueryDto) {
    return this.adminCatalogService.getAdminProducts(query);
  }

  @Post('products')
  @ApiOperation({
    summary: 'Create a new fashion product with bilingual translations, tags, and initial variants',
  })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.adminCatalogService.createProduct(dto);
  }

  @Get('products/:id')
  @ApiOperation({
    summary: 'Get complete product detail for admin editing by ID or slug',
  })
  @ApiParam({ name: 'id', description: 'Product UUID or slug' })
  async getProductById(@Param('id') id: string) {
    return this.adminCatalogService.getAdminProductById(id);
  }

  @Patch('products/:id')
  @ApiOperation({
    summary: 'Update product attributes, translations, and tag associations',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminCatalogService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({
    summary: 'Archive a product (soft-delete / status=archived)',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  async archiveProduct(@Param('id') id: string) {
    return this.adminCatalogService.archiveProduct(id);
  }

  // ------------------------------------------------------------
  // VARIANTS MANAGEMENT
  // ------------------------------------------------------------
  @Post('products/:id/variants')
  @ApiOperation({
    summary: 'Add a new SKU variant to a product and initialize inventory',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  async createVariant(
    @Param('id') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.adminCatalogService.createVariant(productId, dto);
  }

  @Patch('variants/:id')
  @ApiOperation({
    summary: 'Update an existing variant (SKU, color, size, price override, status, image)',
  })
  @ApiParam({ name: 'id', description: 'Variant UUID' })
  async updateVariant(
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.adminCatalogService.updateVariant(id, dto);
  }

  @Delete('variants/:id')
  @ApiOperation({
    summary: 'Delete or deactivate variant (soft-deactivates if referenced in order history)',
  })
  @ApiParam({ name: 'id', description: 'Variant UUID' })
  async deleteVariant(@Param('id') id: string) {
    return this.adminCatalogService.deleteVariant(id);
  }

  // ------------------------------------------------------------
  // COLLECTIONS MANAGEMENT
  // ------------------------------------------------------------
  @Get('collections')
  @ApiOperation({
    summary: 'List all collections with translations and product counts',
  })
  async getCollections() {
    return this.adminCatalogService.getAdminCollections();
  }

  @Post('collections')
  @ApiOperation({
    summary: 'Create a new collection with bilingual translations',
  })
  async createCollection(@Body() dto: CreateCollectionDto) {
    return this.adminCatalogService.createCollection(dto);
  }

  @Patch('collections/:id')
  @ApiOperation({
    summary: 'Update collection details and translations',
  })
  @ApiParam({ name: 'id', description: 'Collection UUID' })
  async updateCollection(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.adminCatalogService.updateCollection(id, dto);
  }

  @Delete('collections/:id')
  @ApiOperation({
    summary: 'Delete a collection',
  })
  @ApiParam({ name: 'id', description: 'Collection UUID' })
  async deleteCollection(@Param('id') id: string) {
    return this.adminCatalogService.deleteCollection(id);
  }
}
