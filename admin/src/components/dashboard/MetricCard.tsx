import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  changePeriod?: string;
  icon: React.ReactNode;
  accentColor?: 'lime' | 'emerald' | 'amber' | 'cyan' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changePeriod = 'vs last week',
  icon,
  accentColor = 'lime',
}) => {
  const isPositive = change !== undefined && change >= 0;

  const accentBorders = {
    lime: 'hover:border-accent-lime/40',
    emerald: 'hover:border-emerald-500/40',
    amber: 'hover:border-amber-500/40',
    cyan: 'hover:border-cyan-500/40',
    purple: 'hover:border-purple-500/40',
  };

  return (
    <div
      className={clsx(
        'p-4 sm:p-5 rounded-sm bg-surface border border-surface-border transition-all duration-200 relative overflow-hidden group',
        accentBorders[accentColor]
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted font-medium truncate">
          {label}
        </span>
        <div className="text-muted group-hover:text-bone transition-colors shrink-0">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xl sm:text-2xl font-mono font-bold text-bone tracking-tight tabular-nums">
          {value}
        </span>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-mono">
          <span
            className={clsx(
              'inline-flex items-center font-semibold px-1 py-0.5 rounded-sm',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-muted/70">{changePeriod}</span>
        </div>
      )}
    </div>
  );
};
