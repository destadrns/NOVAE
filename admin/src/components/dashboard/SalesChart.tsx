import React, { useState } from 'react';
import { AdminSalesTrendPoint } from '@/lib/api';
import { formatIDR } from '@/lib/formatters';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { TrendingUp, BarChart2, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SalesChartProps {
  data?: AdminSalesTrendPoint[];
  growthPercentage?: number;
  isLoading?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  data = [],
  growthPercentage = 0,
  isLoading = false,
}) => {
  const { t } = useAdminTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxSales = data.length > 0 ? Math.max(...data.map((d) => d.sales), 1000000) : 10000000;
  const totalPeriodSales = data.reduce((sum, d) => sum + d.sales, 0);
  const totalPeriodOrders = data.reduce((sum, d) => sum + d.orders, 0);

  // Y-axis grid reference levels (e.g. 100%, 66%, 33%, 0%)
  const yTicks = [
    { label: formatIDR(maxSales), percent: 100 },
    { label: formatIDR(Math.round((maxSales * 2) / 3)), percent: 66 },
    { label: formatIDR(Math.round(maxSales / 3)), percent: 33 },
    { label: 'Rp 0', percent: 0 },
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-center items-center text-center min-h-[260px]">
        <Loader2 className="w-6 h-6 text-accent-lime animate-spin mb-2" />
        <p className="text-xs font-mono text-muted uppercase tracking-wider">
          {t.dashboard.revenueTrendTitle}
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-center items-center text-center min-h-[260px]">
        <BarChart2 className="w-8 h-8 text-muted/50 mb-2" />
        <p className="text-xs font-mono text-muted uppercase tracking-wider">
          {t.dashboard.revenueTrendTitle}
        </p>
        <p className="text-[11px] text-muted/70 mt-1">No sales recorded in selected window</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-between space-y-4">
      {/* Header with Title and Summary Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-bone font-semibold">
              {t.dashboard.revenueTrendTitle}
            </h3>
            {growthPercentage !== 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-accent-lime/10 text-accent-lime text-[9px] font-mono font-bold uppercase tracking-wider border border-accent-lime/20">
                <TrendingUp className="w-2.5 h-2.5" />
                <span>{growthPercentage > 0 ? `+${growthPercentage}%` : `${growthPercentage}%`}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] font-sans text-muted mt-0.5">
            {t.dashboard.revenueTrendSubtitle}
          </p>
        </div>

        {/* Legend / Total Period Volume Badge */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted">
          <div className="flex items-center gap-1.5 bg-charcoal-dark px-2.5 py-1 rounded-sm border border-surface-border">
            <span className="w-2 h-2 rounded-sm bg-accent-lime" />
            <span className="text-bone font-bold">{formatIDR(totalPeriodSales)}</span>
            <span className="text-muted/60">({totalPeriodOrders} {t.dashboard.unitsSold.toLowerCase()})</span>
          </div>
        </div>
      </div>

      {/* Chart Visualization Area with Gridlines and Responsive Bars */}
      <div className="relative pt-2 pb-1">
        {/* Background Grid Lines & Y-Axis Reference */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
          {yTicks.map((tick, idx) => (
            <div key={idx} className="w-full flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted/40 w-16 text-right tabular-nums shrink-0 hidden sm:inline-block">
                {tick.label}
              </span>
              <div className="w-full h-[1px] bg-white/[0.04]" />
            </div>
          ))}
        </div>

        {/* Dynamic Bar Columns */}
        <div className="h-44 sm:h-48 flex items-end justify-between gap-1.5 sm:gap-3 sm:pl-18 relative z-10">
          {data.map((item, index) => {
            const heightPercent = maxSales > 0 ? Math.max(8, Math.round((item.sales / maxSales) * 100)) : 8;
            const isHovered = hoveredIndex === index;

            // Safe tooltip anchor position to prevent overflow at edges
            const tooltipPosClass =
              index === 0
                ? 'left-0 translate-x-0'
                : index === data.length - 1
                ? 'right-0 translate-x-0 left-auto'
                : 'left-1/2 -translate-x-1/2';

            return (
              <div
                key={`${item.date}-${index}`}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating Tooltip with Edge-Safe Positioning */}
                <div
                  className={clsx(
                    'absolute -top-12 z-30 transition-all duration-150 pointer-events-none',
                    tooltipPosClass,
                    isHovered
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95 pointer-events-none'
                  )}
                >
                  <div className="bg-charcoal-dark border border-accent-lime/50 text-bone text-[10px] font-mono px-2.5 py-1.5 rounded-sm shadow-2xl whitespace-nowrap text-center">
                    <div className="font-bold text-accent-lime tabular-nums">
                      {formatIDR(item.sales)}
                    </div>
                    <div className="text-[9px] text-muted">
                      {item.orders} {t.dashboard.unitsSold.toLowerCase()} • {item.date}
                    </div>
                  </div>
                </div>

                {/* The Bar Track & Colored Bar Fill */}
                <div className="w-full max-w-[36px] h-full flex flex-col justify-end bg-white/[0.02] hover:bg-white/[0.06] rounded-t-sm transition-colors duration-150 px-0.5 sm:px-1">
                  <div
                    className={clsx(
                      'w-full rounded-t-sm transition-all duration-300 relative',
                      isHovered
                        ? 'bg-accent-lime shadow-[0_0_15px_rgba(216,255,0,0.35)]'
                        : 'bg-gradient-to-t from-accent-lime/60 to-accent-lime/90'
                    )}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Top Glow Edge */}
                    <div className="w-full h-1 bg-white/70 rounded-t-sm absolute top-0 left-0" />
                  </div>
                </div>

                {/* Date Label */}
                <div className="pt-2 text-center w-full">
                  <span
                    className={clsx(
                      'text-[9px] sm:text-[10px] font-mono transition-colors block truncate px-0.5',
                      isHovered ? 'text-accent-lime font-bold' : 'text-muted/70 group-hover:text-bone'
                    )}
                  >
                    {item.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
