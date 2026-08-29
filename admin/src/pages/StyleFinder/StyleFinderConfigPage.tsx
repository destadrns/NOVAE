import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const StyleFinderConfigPage: React.FC = () => {
  const { t } = useAdminTranslation();

  const archetypes = [
    {
      name: 'The Architectural Minimalist',
      silhouette: 'FORM 01 Boxy Drape',
      coreGarment: 'Oversized Form Jacket',
      scoringFormula: 'Fit: Boxy (40%) + Aesthetic: Monochromatic (40%) + Occasion: Studio (20%)',
    },
    {
      name: 'The Kinetic Urbanite',
      silhouette: 'MOTION Dynamic Wrap',
      coreGarment: 'Fluid Motion Kimono Shirt',
      scoringFormula: 'Fit: Flowing (40%) + Aesthetic: Minimal (30%) + Occasion: Urban (30%)',
    },
    {
      name: 'The Radical Sculptor',
      silhouette: 'IDENTITY Raw Cut Trench',
      coreGarment: 'Identity Raw Trench Coat',
      scoringFormula: 'Fit: Sculptural (40%) + Aesthetic: Brutalist (40%) + Occasion: Statement (20%)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.styleFinder.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.styleFinder.subtitle}
          </p>
        </div>
        <Badge variant="lime" size="md">
          {t.styleFinder.badgeTitle}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {archetypes.map((arch) => (
          <Card key={arch.name} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-lime" />
                <span className="font-mono text-xs font-bold text-bone uppercase">
                  {arch.name}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-muted uppercase block">
                  {t.styleFinder.anchorSilhouette}
                </span>
                <span className="text-bone">{arch.silhouette}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase block">
                  {t.styleFinder.keyPiece}
                </span>
                <span className="text-accent-lime font-semibold">{arch.coreGarment}</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] text-muted uppercase block mb-1">
                  {t.styleFinder.scoringWeights}
                </span>
                <div className="p-2.5 bg-charcoal-dark border border-surface-border rounded-sm text-[11px] text-muted leading-relaxed">
                  {arch.scoringFormula}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-muted">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t.styleFinder.activeInStorefront}</span>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
