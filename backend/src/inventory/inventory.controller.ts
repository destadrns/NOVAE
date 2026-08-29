import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdminInventoryQueryDto } from './dto/admin-inventory-query.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import {
  InventoryItemDto,
  InventoryMovementItemDto,
  PaginatedInventoryResponseDto,
} from './dto/inventory-response.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Inventory (Protected)')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({
    summary: 'List all inventory items with filtering, search, and stock health classification',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of inventory items with metrics summary',
    type: PaginatedInventoryResponseDto,
  })
  async getInventory(
    @Query() query: AdminInventoryQueryDto,
  ): Promise<PaginatedInventoryResponseDto> {
    return this.inventoryService.getInventory(query);
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'List all variants currently in low-stock or out-of-stock condition',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of low stock / out of stock inventory items',
    type: [InventoryItemDto],
  })
  async getLowStockInventory(): Promise<InventoryItemDto[]> {
    return this.inventoryService.getLowStockInventory();
  }

  @Get(':variantId')
  @ApiOperation({
    summary: 'Get detailed inventory record for a specific variant',
  })
  @ApiParam({ name: 'variantId', description: 'Product Variant UUID' })
  @ApiResponse({
    status: 200,
    description: 'Detailed inventory record',
    type: InventoryItemDto,
  })
  async getVariantInventory(
    @Param('variantId') variantId: string,
  ): Promise<InventoryItemDto> {
    return this.inventoryService.getVariantInventory(variantId);
  }

  @Patch(':variantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adjust inventory stock on hand with transactional audit movement logging',
  })
  @ApiParam({ name: 'variantId', description: 'Product Variant UUID' })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully and movement recorded',
    type: InventoryItemDto,
  })
  async adjustStock(
    @Param('variantId') variantId: string,
    @Body() dto: AdjustInventoryDto,
    @CurrentUser() adminUser: any,
  ): Promise<InventoryItemDto> {
    return this.inventoryService.adjustStock(variantId, dto, adminUser);
  }

  @Get(':variantId/movements')
  @ApiOperation({
    summary: 'Get chronological audit trail of stock movements for a specific variant',
  })
  @ApiParam({ name: 'variantId', description: 'Product Variant UUID' })
  @ApiResponse({
    status: 200,
    description: 'Array of movement audit log records',
    type: [InventoryMovementItemDto],
  })
  async getVariantMovements(
    @Param('variantId') variantId: string,
  ): Promise<InventoryMovementItemDto[]> {
    return this.inventoryService.getVariantMovements(variantId);
  }
}
