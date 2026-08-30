import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import {
  DashboardOverviewResponseDto,
  MetricSummaryDto,
  SalesTrendPointDto,
  CapsuleShareDto,
  TopSellingProductDto,
  LowStockAlertDto,
  RecentOrderSummaryDto,
  CustomerActivityDto,
  StyleFinderMetricDto,
} from './dto/analytics-response.dto';
import { OrderStatus, LanguageCode } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves date windows for current and preceding period comparison
   */
  private resolveDateWindows(query: AnalyticsQueryDto): {
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date;
    previousEnd: Date;
    daysCount: number;
  } {
    const now = new Date();
    let currentStart: Date;
    let currentEnd = now;
    let daysCount = 30;

    if (query.startDate) {
      currentStart = new Date(query.startDate);
      if (query.endDate) {
        currentEnd = query.endDate.includes('T')
          ? new Date(query.endDate)
          : new Date(`${query.endDate}T23:59:59.999Z`);
      } else {
        currentEnd = now;
      }
      daysCount = Math.max(1, Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      switch (query.range) {
        case '7d':
          daysCount = 7;
          currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          daysCount = 90;
          currentStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          daysCount = 365;
          currentStart = new Date(0); // Epoch
          break;
        case '30d':
        default:
          daysCount = 30;
          currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    const durationMs = Math.max(1000, currentEnd.getTime() - currentStart.getTime());
    const previousEnd = new Date(currentStart.getTime());
    const previousStart = new Date(previousEnd.getTime() - durationMs);

    return { currentStart, currentEnd, previousStart, previousEnd, daysCount };
  }

  /**
   * Helper to compute percentage change safely
   */
  private computePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10;
  }

  /**
   * Returns complete dashboard overview analytics
   */
  async getDashboardOverview(query: AnalyticsQueryDto): Promise<DashboardOverviewResponseDto> {
    const { currentStart, currentEnd, previousStart, previousEnd, daysCount } = this.resolveDateWindows(query);
    const lang = (query.lang || 'id') as LanguageCode;

    // 1. ORDERS IN CURRENT & PREVIOUS PERIOD
    const isAllTime = query.range === 'all';
    const orderWhereCurrent = isAllTime
      ? { status: { not: OrderStatus.cancelled } }
      : {
          createdAt: { gte: currentStart, lte: currentEnd },
          status: { not: OrderStatus.cancelled },
        };

    const orderWherePrevious = isAllTime
      ? { status: { not: OrderStatus.cancelled } }
      : {
          createdAt: { gte: previousStart, lte: previousEnd },
          status: { not: OrderStatus.cancelled },
        };

    const [currentOrders, prevOrderAgg, totalStockAgg, inventoryItems] = await Promise.all([
      this.prisma.order.findMany({
        where: orderWhereCurrent,
        include: { items: true },
      }),
      this.prisma.order.aggregate({
        where: orderWherePrevious,
        _sum: { totalIdr: true },
        _count: { id: true },
      }),
      this.prisma.inventory.aggregate({
        _sum: { quantityOnHand: true },
      }),
      this.prisma.inventory.findMany({
        include: {
          variant: {
            include: {
              product: {
                include: {
                  translations: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const currentGrossSales = currentOrders.reduce((sum, o) => sum + Number(o.totalIdr), 0);
    const prevGrossSales = Number(prevOrderAgg._sum.totalIdr || 0);
    const totalOrdersCount = currentOrders.length;
    const prevOrdersCount = prevOrderAgg._count.id || 0;
    const totalPiecesSold = currentOrders.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, i) => itemSum + i.quantity, 0),
      0,
    );

    const grossSalesChange = this.computePercentageChange(currentGrossSales, prevGrossSales);
    const totalOrdersChange = this.computePercentageChange(totalOrdersCount, prevOrdersCount);
    const averageOrderValue = totalOrdersCount > 0 ? Math.round(currentGrossSales / totalOrdersCount) : 0;

    // 2. INVENTORY HEALTH & STOCK AVAILABILITY
    const totalPiecesInStock = totalStockAgg._sum.quantityOnHand || 0;
    const lowStockAlerts: LowStockAlertDto[] = [];

    for (const item of inventoryItems) {
      const stock = item.quantityOnHand;
      const reserved = item.reservedQuantity;
      const available = stock - reserved;
      const threshold = item.lowStockThreshold;

      const isLow = available <= threshold || stock <= threshold;
      const isOut = available <= 0;

      if (isLow || isOut) {
        const product = item.variant.product;
        const translation =
          product.translations.find((t) => t.language === lang) ||
          product.translations.find((t) => t.language === LanguageCode.id) ||
          product.translations[0];

        lowStockAlerts.push({
          id: item.id,
          variantId: item.variant.id,
          productId: product.id,
          productName: translation?.name || product.slug,
          sku: item.variant.sku,
          color: item.variant.colorName,
          size: item.variant.size,
          stock,
          reserved,
          available,
          threshold,
          status: isOut ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        });
      }
    }

    // 3. CUSTOMER METRICS & ACTIVITY
    const [totalCustomersCount, newCustomersCount, prevNewCustomersCount, activeCartsCount, totalWishlistCount] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'customer' } }),
        isAllTime
          ? this.prisma.user.count({ where: { role: 'customer' } })
          : this.prisma.user.count({
              where: { role: 'customer', createdAt: { gte: currentStart, lte: currentEnd } },
            }),
        isAllTime
          ? 0
          : this.prisma.user.count({
              where: { role: 'customer', createdAt: { gte: previousStart, lte: previousEnd } },
            }),
        this.prisma.cart.count({ where: { status: 'active' } }),
        this.prisma.wishlistItem.count(),
      ]);

    const activeCustomersChange = this.computePercentageChange(newCustomersCount, prevNewCustomersCount);

    const customerActivity: CustomerActivityDto = {
      totalCustomers: totalCustomersCount,
      newCustomers: newCustomersCount,
      activeCarts: activeCartsCount,
      totalWishlistItems: totalWishlistCount,
    };

    // 4. SALES TREND (Daily Bucketing for chart)
    const salesTrend = this.buildSalesTrend(currentOrders, daysCount <= 14 ? daysCount : 7);

    // 5. CAPSULE / COLLECTION SHARE
    const capsuleDistribution = await this.buildCapsuleDistribution(currentOrders, lang);

    // 6. ORDER STATUS DISTRIBUTION
    const statusGroups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const orderStatusDistribution: Record<string, number> = {
      pending: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const sg of statusGroups) {
      orderStatusDistribution[sg.status] = sg._count.id;
    }

    // 7. TOP SELLING PRODUCTS
    const topSellingProducts = await this.buildTopSellingProducts(lang);

    // 8. RECENT ORDERS TABLE
    const recentOrdersRaw = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    const recentOrders: RecentOrderSummaryDto[] = recentOrdersRaw.map((o) => {
      const snap = o.shippingAddressSnapshot as Record<string, any> | null;
      const recipientName = snap?.recipientName || o.customerEmail.split('@')[0];
      const city = snap?.city || 'Jakarta';
      const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: recipientName,
        customerEmail: o.customerEmail,
        shippingCity: city,
        itemCount,
        totalAmount: Number(o.totalIdr),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      };
    });

    // 9. STYLE FINDER METRICS
    const [totalProfiles, archetypeGroups] = await Promise.all([
      this.prisma.styleProfile.count(),
      this.prisma.styleProfile.groupBy({
        by: ['archetypeCode'],
        _count: { id: true },
      }),
    ]);

    const archetypeDistribution: Record<string, number> = {};
    for (const ag of archetypeGroups) {
      archetypeDistribution[ag.archetypeCode] = ag._count.id;
    }

    const styleFinder: StyleFinderMetricDto = {
      totalProfiles,
      archetypeDistribution,
    };

    const metrics: MetricSummaryDto = {
      grossSales: currentGrossSales,
      grossSalesChange,
      totalOrders: totalOrdersCount,
      totalOrdersChange,
      totalPiecesInStock,
      totalPiecesSold,
      lowStockItemsCount: lowStockAlerts.length,
      activeCustomers: totalCustomersCount,
      activeCustomersChange,
      averageOrderValue,
    };

    return {
      metrics,
      salesTrend,
      capsuleDistribution,
      orderStatusDistribution,
      topSellingProducts,
      lowStockAlerts: lowStockAlerts.slice(0, 10),
      recentOrders,
      customerActivity,
      styleFinder,
    };
  }

  /**
   * Builds day-by-day sales data points for continuous chart visualization
   */
  private buildSalesTrend(orders: any[], pointsCount: number): SalesTrendPointDto[] {
    const points: SalesTrendPointDto[] = [];
    const now = new Date();

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      const dayOrders = orders.filter((o) => {
        const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDateStr === dateStr;
      });

      const daySales = dayOrders.reduce((sum, o) => sum + Number(o.totalIdr), 0);
      points.push({
        date: displayLabel,
        sales: daySales,
        orders: dayOrders.length,
      });
    }

    return points;
  }

  /**
   * Calculates revenue & piece breakdown per collection capsule
   */
  private async buildCapsuleDistribution(orders: any[], lang: LanguageCode): Promise<CapsuleShareDto[]> {
    const collections = await this.prisma.collection.findMany({
      include: {
        translations: true,
        products: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const collectionMap = new Map<
      string,
      { code: string; label: string; tagline: string; pieces: number; revenue: number; color: string; textColor: string }
    >();

    const colorPresets = [
      { code: 'FORM', color: 'bg-accent-lime', textColor: 'text-accent-lime', tagline: 'Architectural Heavyweight' },
      { code: 'MOTION', color: 'bg-cyan-400', textColor: 'text-cyan-400', tagline: 'Kinetic Cupro & Sandwashed' },
      { code: 'IDENTITY', color: 'bg-purple-400', textColor: 'text-purple-400', tagline: 'Raw-Cut Statement Series' },
    ];

    for (let idx = 0; idx < collections.length; idx++) {
      const col = collections[idx];
      const preset = colorPresets.find((p) => p.code === col.code) || {
        code: col.code,
        color: idx % 2 === 0 ? 'bg-accent-lime' : 'bg-cyan-400',
        textColor: idx % 2 === 0 ? 'text-accent-lime' : 'text-cyan-400',
        tagline: col.description || `${col.name} Capsule`,
      };

      const tr =
        col.translations.find((t) => t.language === lang) ||
        col.translations.find((t) => t.language === LanguageCode.id) ||
        col.translations[0];

      collectionMap.set(col.id, {
        code: col.code,
        label: `${col.code} CAPSULE`,
        tagline: preset.tagline,
        pieces: 0,
        revenue: 0,
        color: preset.color,
        textColor: preset.textColor,
      });
    }

    // Map order items to collections
    const productCollectionLookup = new Map<string, string>();
    for (const col of collections) {
      for (const prod of col.products) {
        productCollectionLookup.set(prod.id, col.id);
      }
    }

    let totalSoldPieces = 0;
    for (const order of orders) {
      for (const item of order.items) {
        const colId = productCollectionLookup.get(item.productId);
        if (colId && collectionMap.has(colId)) {
          const colData = collectionMap.get(colId)!;
          colData.pieces += item.quantity;
          colData.revenue += Number(item.lineTotalIdr);
          totalSoldPieces += item.quantity;
        }
      }
    }

    // Convert map to array with share percentage
    const result: CapsuleShareDto[] = [];
    collectionMap.forEach((val) => {
      const share = totalSoldPieces > 0 ? Math.round((val.pieces / totalSoldPieces) * 100) : 0;
      result.push({
        code: val.code,
        label: val.label,
        tagline: val.tagline,
        share,
        pieces: val.pieces,
        revenue: val.revenue,
        color: val.color,
        textColor: val.textColor,
      });
    });

    return result;
  }

  /**
   * Aggregates top selling products from OrderItems
   */
  private async buildTopSellingProducts(lang: LanguageCode): Promise<TopSellingProductDto[]> {
    const topItemGroups = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        lineTotalIdr: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    if (topItemGroups.length === 0) {
      return [];
    }

    const productIds = topItemGroups.map((g) => g.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        translations: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return topItemGroups.map((g) => {
      const prod = productMap.get(g.productId);
      const tr =
        prod?.translations.find((t) => t.language === lang) ||
        prod?.translations.find((t) => t.language === LanguageCode.id) ||
        prod?.translations[0];

      return {
        id: g.productId,
        name: tr?.name || prod?.slug || 'Product',
        slug: prod?.slug || '',
        skuRoot: prod?.skuRoot || '',
        category: prod?.category.name || 'Apparel',
        unitsSold: g._sum.quantity || 0,
        revenue: Number(g._sum.lineTotalIdr || 0),
        imageUrl: prod?.primaryImageUrl,
      };
    });
  }
}
