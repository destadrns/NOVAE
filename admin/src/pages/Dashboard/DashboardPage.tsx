import React from 'react';
import { useAdminDataStore } from '@/store/useAdminDataStore';
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
  Download,
  Boxes,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { metrics, inventory } = useAdminDataStore();
  const { t, format } = useAdminTranslation();

  const lowStockCount = inventory.filter(
    (i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK'
  ).length;

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
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex"
            onClick={() => alert(t.dashboard.exportAlert)}
          >
            {t.dashboard.exportReport}
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={t.dashboard.grossRevenue}
          value={formatIDR(metrics.grossSales)}
          change={metrics.grossSalesChange}
          changePeriod={t.dashboard.vsLastWeek}
          icon={<DollarSign className="w-4 h-4 text-accent-lime" />}
          accentColor="lime"
        />
        <MetricCard
          label={t.dashboard.totalOrders}
          value={`${metrics.totalOrders} ${t.dashboard.unitsSold}`}
          change={metrics.totalOrdersChange}
          changePeriod={t.dashboard.vsLastWeek}
          icon={<ShoppingBag className="w-4 h-4 text-cyan-400" />}
          accentColor="cyan"
        />
        <MetricCard
          label={t.dashboard.stockAvailability}
          value={`${metrics.totalPiecesInStock} ${t.dashboard.piecesInStock}`}
          change={-2.4}
          changePeriod={format(t.dashboard.lowStockCountSubtitle, { count: lowStockCount })}
          icon={<Package className="w-4 h-4 text-amber-400" />}
          accentColor="amber"
        />
        <MetricCard
          label={t.dashboard.activeClients}
          value={`${metrics.activeCustomers} ${t.dashboard.profilesCount}`}
          change={metrics.activeCustomersChange}
          changePeriod={t.dashboard.vsLastWeek}
          icon={<Users className="w-4 h-4 text-purple-400" />}
          accentColor="purple"
        />
      </div>

      {/* Revenue Trend & Collection Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryShare />
        </div>
      </div>

      {/* Operational Queues: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlerts />
        </div>
      </div>
    </div>
  );
};
