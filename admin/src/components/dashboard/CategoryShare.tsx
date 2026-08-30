import React from 'react';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { AdminCapsuleShare } from '@/lib/api';
import { Loader2, PieChart } from 'lucide-react';

interface CategoryShareProps {
  shares?: AdminCapsuleShare[];
  isLoading?: boolean;
}

export const CategoryShare: React.FC<CategoryShareProps> = ({
  shares = [],
  isLoading = false,
}) => {
  const { t, format } = useAdminTranslation();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-center items-center text-center min-h-[260px]">
        <Loader2 className="w-6 h-6 text-accent-lime animate-spin mb-2" />
        <p className="text-xs font-mono text-muted uppercase tracking-wider">
          {t.dashboard.capsuleShareTitle}
        </p>
      </div>
    );
  }

  if (shares.length === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-center items-center text-center min-h-[260px]">
        <PieChart className="w-8 h-8 text-muted/50 mb-2" />
        <p className="text-xs font-mono text-muted uppercase tracking-wider">
          {t.dashboard.capsuleShareTitle}
        </p>
        <p className="text-[11px] text-muted/70 mt-1">No collection sales data available</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-widest text-bone font-semibold">
            {t.dashboard.capsuleShareTitle}
          </h3>
        </div>
        <p className="text-[11px] font-sans text-muted mt-0.5">
          {t.dashboard.capsuleShareSubtitle}
        </p>
      </div>

      {/* Progress Bar Stack with Glow */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded-sm bg-white/5 overflow-hidden flex gap-1 p-0.5 bg-charcoal-dark border border-surface-border">
          {shares.map((s) => (
            <div
              key={s.code}
              className={`h-full ${s.color} rounded-xs transition-all duration-300`}
              style={{ width: `${Math.max(4, s.share)}%` }}
              title={`${s.label}: ${s.share}%`}
            />
          ))}
        </div>
      </div>

      {/* Breakdown Legend */}
      <div className="space-y-3 pt-1">
        {shares.map((s) => (
          <div
            key={s.code}
            className="p-2.5 rounded-sm bg-charcoal border border-surface-border hover:border-white/10 transition-colors flex items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-xs ${s.color} shrink-0`} />
              <div className="min-w-0">
                <div className="text-bone uppercase text-[11px] font-bold truncate">
                  {s.label}
                </div>
                <div className="text-[9px] text-muted/60 truncate font-sans">
                  {s.tagline}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-bold text-xs tabular-nums ${s.textColor}`}>
                {s.share}%
              </div>
              <div className="text-[9px] text-muted">
                {format(t.dashboard.piecesSold, { count: s.pieces })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
