import React from 'react';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';

export const CategoryShare: React.FC = () => {
  const { t, format } = useAdminTranslation();

  const shares = [
    {
      label: 'FORM CAPSULE',
      tagline: 'Architectural Heavyweight',
      share: 48,
      pieces: format(t.dashboard.piecesSold, { count: 42 }),
      color: 'bg-accent-lime',
      textColor: 'text-accent-lime',
    },
    {
      label: 'MOTION CAPSULE',
      tagline: 'Kinetic Cupro & Sandwashed',
      share: 32,
      pieces: format(t.dashboard.piecesSold, { count: 28 }),
      color: 'bg-cyan-400',
      textColor: 'text-cyan-400',
    },
    {
      label: 'IDENTITY CAPSULE',
      tagline: 'Raw-Cut Statement Series',
      share: 20,
      pieces: format(t.dashboard.piecesSold, { count: 18 }),
      color: 'bg-purple-400',
      textColor: 'text-purple-400',
    },
  ];

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
              key={s.label}
              className={`h-full ${s.color} rounded-xs transition-all duration-300`}
              style={{ width: `${s.share}%` }}
              title={`${s.label}: ${s.share}%`}
            />
          ))}
        </div>
      </div>

      {/* Breakdown Legend */}
      <div className="space-y-3 pt-1">
        {shares.map((s) => (
          <div
            key={s.label}
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
              <div className="text-[9px] text-muted">{s.pieces}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
