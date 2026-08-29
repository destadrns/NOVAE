import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { LanguageQueryDto } from './dto/language-query.dto';
import { PaginatedProductsDto } from './dto/response/paginated-products.dto';
import { ProductDetailDto } from './dto/response/product-detail.dto';
import { CategoryDto } from './dto/response/category.dto';
import { CollectionDto } from './dto/response/collection.dto';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  @ApiOperation({
    summary: 'List all active product categories',
    description: 'Returns all active categories with their slugs and sort order.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active categories',
    type: [CategoryDto],
  })
  async getCategories(): Promise<CategoryDto[]> {
    return this.catalogService.getCategories();
  }

  @Get('collections')
  @ApiOperation({
    summary: 'List all published collections',
    description: 'Returns published collections with localized titles and descriptions.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published collections',
    type: [CollectionDto],
  })
  async getCollections(@Query() query: LanguageQueryDto): Promise<CollectionDto[]> {
    return this.catalogService.getCollections(query.language);
  }

  @Get('collections/:slug')
  @ApiOperation({
    summary: 'Get collection details by slug',
    description: 'Returns localized collection details by slug.',
  })
  @ApiParam({
    name: 'slug',
    example: 'form',
    description: 'Unique collection slug (e.g. form, motion, identity)',
  })
  @ApiResponse({
    status: 200,
    description: 'Collection details',
    type: CollectionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
  })
  async getCollectionBySlug(
    @Param('slug') slug: string,
    @Query() query: LanguageQueryDto,
  ): Promise<CollectionDto> {
    return this.catalogService.getCollectionBySlug(slug, query.language);
  }

  @Get('products')
  @ApiOperation({
    summary: 'Query and filter products catalog',
    description:
      'Returns a paginated list of active products supporting multi-faceted filters (category, collection, size, color, tags, price range, free-text search) and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products matching filter criteria',
    type: PaginatedProductsDto,
  })
  async getProducts(@Query() query: GetProductsQueryDto): Promise<PaginatedProductsDto> {
    return this.catalogService.getProducts(query);
  }

  @Get('products/:slug')
  @ApiOperation({
    summary: 'Get single product detail by slug',
    description:
      'Returns localized product information, categories, collections, public images, customer-safe variant availability, colors, sizes, and tags.',
  })
  @ApiParam({
    name: 'slug',
    example: 'oversized-form-jacket',
    description: 'Unique product slug',
  })
  @ApiResponse({
    status: 200,
    description: 'Product detail payload',
    type: ProductDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getProductBySlug(
    @Param('slug') slug: string,
    @Query() query: LanguageQueryDto,
  ): Promise<ProductDetailDto> {
    return this.catalogService.getProductBySlug(slug, query.language);
  }
}
