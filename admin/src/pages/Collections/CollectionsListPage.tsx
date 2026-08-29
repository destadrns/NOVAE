import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { Edit3, Plus } from 'lucide-react';

export const CollectionsListPage: React.FC = () => {
  const { t, format } = useAdminTranslation();

  const collections = [
    {
      id: 'col-form',
      name: 'FORM',
      tagline: 'Structured silhouettes.',
      description:
        'Architectural exploration of volume, clean bold geometry, and intentional drape. Tailored with double-face heavy wool and high-density twill.',
      accentQuote: 'Structure is not constraint. Structure is clarity.',
      materialSpec: 'Double-Face Recycled Wool & 450 GSM Twill',
      palette: 'Pitch Obsidian • Raw Stone • Slate',
      piecesCount: 2,
      status: t.status.published,
      coverImage:
        'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'col-motion',
      name: 'MOTION',
      tagline: 'Designed for movement.',
      description:
        'Fluidity in kinetic rhythm. Fabrics chosen for dynamic flow in wind and natural drape in stride.',
      accentQuote: 'A garment only truly awakens when the body moves.',
      materialSpec: 'Sandwashed Eco-Cupro & Silk Blend',
      palette: 'Bone Off-White • Charcoal Shadow',
      piecesCount: 2,
      status: t.status.published,
      coverImage:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'col-identity',
      name: 'IDENTITY',
      tagline: 'Crafted for expression.',
      description:
        'Raw cut details, modular fastenings, and unconventional proportions standing outside seasonal cycles.',
      accentQuote: 'WEAR THE UNEXPECTED. Define your own form.',
      materialSpec: 'High-Density Japanese Cotton Gabardine',
      palette: 'Obsidian Black • Earth Umber • Raw Sand',
      piecesCount: 2,
      status: t.status.published,
      coverImage:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.collections.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.collections.subtitle}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => alert('New capsule series builder modal...')}
        >
          {t.collections.createCapsuleBtn}
        </Button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((col) => (
          <Card key={col.id} className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="relative h-48 rounded-sm overflow-hidden border border-surface-border">
                <img
                  src={col.coverImage}
                  alt={col.name}
                  className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="emerald" size="sm">
                    {col.status}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="font-mono text-xs font-bold text-bone bg-black/70 px-2 py-1 rounded-sm border border-white/10 uppercase tracking-widest">
                    {col.name}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-mono text-sm font-bold text-bone uppercase tracking-wider">
                  {col.tagline}
                </h3>
                <p className="text-xs font-sans text-muted mt-1 leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="p-3 bg-charcoal-dark border border-surface-border rounded-sm space-y-1.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted uppercase block">
                    {t.collections.specMaterials}
                  </span>
                  <span className="text-bone text-[11px]">{col.materialSpec}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase block">
                    {t.collections.curatedPalette}
                  </span>
                  <span className="text-bone text-[11px]">{col.palette}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
              <span className="font-mono text-xs text-muted">
                {format(t.collections.corePiecesCount, { count: col.piecesCount })}
              </span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-3 h-3" />}>
                  {t.collections.editBtn}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
