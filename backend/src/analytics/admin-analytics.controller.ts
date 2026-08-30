import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import {
  DashboardOverviewResponseDto,
  MetricSummaryDto,
  SalesTrendPointDto,
  LowStockAlertDto,
  StyleFinderMetricDto,
} from './dto/analytics-response.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Analytics (Protected)')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get full operational analytics dashboard overview' })
  @ApiResponse({ status: 200, type: DashboardOverviewResponseDto })
  async getOverview(@Query() query: AnalyticsQueryDto): Promise<DashboardOverviewResponseDto> {
    return this.analyticsService.getDashboardOverview(query);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue trends and capsule sales share' })
  @ApiResponse({ status: 200 })
  async getRevenue(@Query() query: AnalyticsQueryDto) {
    const overview = await this.analyticsService.getDashboardOverview(query);
    return {
      metrics: {
        grossSales: overview.metrics.grossSales,
        grossSalesChange: overview.metrics.grossSalesChange,
        averageOrderValue: overview.metrics.averageOrderValue,
      },
      salesTrend: overview.salesTrend,
      capsuleDistribution: overview.capsuleDistribution,
      topSellingProducts: overview.topSellingProducts,
    };
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory health and stock alert metrics' })
  @ApiResponse({ status: 200 })
  async getInventory(@Query() query: AnalyticsQueryDto) {
    const overview = await this.analyticsService.getDashboardOverview(query);
    return {
      totalPiecesInStock: overview.metrics.totalPiecesInStock,
      lowStockItemsCount: overview.metrics.lowStockItemsCount,
      lowStockAlerts: overview.lowStockAlerts,
    };
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get order volume, status breakdown, and recent activity' })
  @ApiResponse({ status: 200 })
  async getOrders(@Query() query: AnalyticsQueryDto) {
    const overview = await this.analyticsService.getDashboardOverview(query);
    return {
      totalOrders: overview.metrics.totalOrders,
      totalOrdersChange: overview.metrics.totalOrdersChange,
      totalPiecesSold: overview.metrics.totalPiecesSold,
      orderStatusDistribution: overview.orderStatusDistribution,
      recentOrders: overview.recentOrders,
    };
  }

  @Get('style-finder')
  @ApiOperation({ summary: 'Get Style Finder completion rates and archetype metrics' })
  @ApiResponse({ status: 200, type: StyleFinderMetricDto })
  async getStyleFinder(@Query() query: AnalyticsQueryDto) {
    const overview = await this.analyticsService.getDashboardOverview(query);
    return overview.styleFinder;
  }
}
