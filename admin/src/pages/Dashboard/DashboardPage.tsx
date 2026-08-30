import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminLanguageStore } from '@/store/useAdminLanguageStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable';
import { LowStockAlerts } from '@/components/dashboard/LowStockAlerts';
import { CategoryShare } from '@/components/dashboard/CategoryShare';
import { formatIDR } from '@/lib/formatters';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Plus,
  Boxes,
  RefreshCw,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { adminGetAnalyticsOverview, AdminDashboardOverview } from '@/lib/api';

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const DashboardPage: React.FC = () => {
  const { token } = useAdminAuthStore();
  const { language } = useAdminLanguageStore();
  const { t, format } = useAdminTranslation();

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await adminGetAnalyticsOverview(token, timeRange, language);
    if (data) {
      setOverview(data);
    } else {
      setError(Array.isArray(err?.message) ? err.message.join(', ') : err?.message || 'Failed to fetch analytics overview');
    }
    setIsLoading(false);
  }, [token, timeRange, language]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const metrics = overview?.metrics;

  return (
    <div className="space-y-6">
      {/* Page Header & Operational Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.dashboard.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center bg-charcoal border border-surface-border rounded-sm p-0.5">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((r) => {
              const labelMap: Record<TimeRange, string> = {
                '7d': t.dashboard.timeRange7d || '7D',
                '30d': t.dashboard.timeRange30d || '30D',
                '90d': t.dashboard.timeRange90d || '90D',
                all: t.dashboard.timeRangeAll || 'ALL',
              };
              return (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-xs transition-colors ${
                    timeRange === r
                      ? 'bg-accent-lime text-obsidian font-bold'
                      : 'text-muted hover:text-bone'
                  }`}
                >
                  {labelMap[r]}
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOverview}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            {t.dashboard.refreshBtn || 'Refresh'}
          </Button>

          <Link to="/products">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {t.dashboard.addProduct}
            </Button>
          </Link>
          <Link to="/inventory">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Boxes className="w-3.5 h-3.5" />}
            >
              {t.dashboard.stockMatrix}
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 border border-rose-500/30 rounded-sm bg-rose-500/10 flex items-center justify-between text-xs font-mono text-rose-300">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchOverview}>
            Retry
          </Button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={t.dashboard.grossRevenue}
          value={isLoading ? '...' : formatIDR(metrics?.grossSales || 0)}
          change={metrics?.grossSalesChange || 0}
          changePeriod={t.dashboard.vsLastWeek}
          icon={<DollarSign className="w-4 h-4 text-accent-lime" />}
          accentColor="lime"
        />
        <MetricCard
          label={t.dashboard.totalOrders}
          value={isLoading ? '...' : `${metrics?.totalOrders || 0} ${t.dashboard.unitsSold}`}
          change={metrics?.totalOrdersChange || 0}
          changePeriod={t.dashboard.vsLastWeek}
          icon={<ShoppingBag className="w-4 h-4 text-cyan-400" />}
          accentColor="cyan"
        />
        <MetricCard
          label={t.dashboard.stockAvailability}
          value={isLoading ? '...' : `${metrics?.totalPiecesInStock || 0} ${t.dashboard.piecesInStock}`}
          change={-(metrics?.lowStockItemsCount || 0)}
          changePeriod={format(t.dashboard.lowStockCountSubtitle, {
            count: metrics?.lowStockItemsCount || 0,
          })}
          icon={<Package className="w-4 h-4 text-amber-400" />}
          accentColor="amber"
        />
        <MetricCard
          label={t.dashboard.activeClients}
          value={isLoading ? '...' : `${metrics?.activeCustomers || 0} ${t.dashboard.profilesCount}`}
          change={metrics?.activeCustomersChange || 0}
          changePeriod={t.dashboard.vsLastWeek}
          icon={<Users className="w-4 h-4 text-purple-400" />}
          accentColor="purple"
        />
      </div>

      {/* Revenue Trend & Collection Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart
            data={overview?.salesTrend}
            growthPercentage={metrics?.grossSalesChange}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <CategoryShare
            shares={overview?.capsuleDistribution}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Operational Queues: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable
            orders={overview?.recentOrders}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlerts
            alerts={overview?.lowStockAlerts}
            isLoading={isLoading}
            onRestocked={fetchOverview}
          />
        </div>
      </div>

      {/* Secondary Analytics: Top Selling Products + Style Finder Insights */}
      {overview && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Top Selling Products */}
          <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border space-y-4">
            <div className="border-b border-white/5 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-bone font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-lime" />
                  <span>{t.dashboard.topSellingTitle || 'Top Selling Products'}</span>
                </h3>
                <p className="text-[11px] font-sans text-muted mt-0.5">
                  {t.dashboard.topSellingSubtitle || 'Ranked by unit sales volume'}
                </p>
              </div>
            </div>
            {overview.topSellingProducts.length === 0 ? (
              <p className="text-xs font-mono text-muted py-4 text-center">
                {t.dashboard.topSellingEmpty || 'No product sales recorded yet'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {overview.topSellingProducts.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 bg-charcoal border border-surface-border rounded-sm text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-accent-lime">0{idx + 1}</span>
                      <div className="min-w-0">
                        <h4 className="font-mono text-bone font-semibold truncate max-w-[200px]">{p.name}</h4>
                        <div className="text-[10px] text-muted font-mono">{p.skuRoot} • {p.category}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <div className="text-bone font-bold">{p.unitsSold} {t.dashboard.unitsSold.toLowerCase()}</div>
                      <div className="text-[10px] text-accent-lime">{formatIDR(p.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Style Finder Archetypes */}
          <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border space-y-4">
            <div className="border-b border-white/5 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-bone font-semibold flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.dashboard.styleFinderTitle || 'Style Finder Insights'}</span>
                </h3>
                <p className="text-[11px] font-sans text-muted mt-0.5">
                  {format(t.dashboard.styleFinderSubtitle || '{count} completed style questionnaires', {
                    count: overview.styleFinder.totalProfiles,
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {Object.entries(overview.styleFinder.archetypeDistribution).map(([archetype, count]) => {
                const total = Math.max(1, overview.styleFinder.totalProfiles);
                const percent = Math.round((count / total) * 100);
                const cleanName = archetype.replace(/_/g, ' ');

                return (
                  <div key={archetype} className="p-2.5 bg-charcoal border border-surface-border rounded-sm space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-bone uppercase text-[11px] font-semibold">{cleanName}</span>
                      <span className="text-cyan-400 font-bold">{count} ({percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-xs overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-xs transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
