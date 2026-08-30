import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { adminGetCollections, BackendCollection } from '@/lib/api';
import { CollectionFormModal } from './CollectionFormModal';
import { Edit3, Plus, RefreshCw } from 'lucide-react';

const FALLBACK_COLLECTIONS: BackendCollection[] = [
  {
    id: 'col-form',
    code: 'FORM',
    slug: 'form',
    name: 'FORM — Chapter 01',
    description:
      'Architectural exploration of volume, clean bold geometry, and intentional drape. Tailored with double-face heavy wool and high-density twill.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    sortOrder: 1,
    productsCount: 2,
    translations: [
      {
        id: 't-1',
        language: 'id',
        name: 'FORM — Chapter 01',
        description: 'Eksplorasi arsitektural volume, geometri tegas, dan drape presisi.',
      },
      {
        id: 't-2',
        language: 'en',
        name: 'FORM — Chapter 01',
        description: 'Architectural exploration of volume, clean bold geometry, and intentional drape.',
      },
    ],
  },
  {
    id: 'col-motion',
    code: 'MOTION',
    slug: 'motion',
    name: 'MOTION — Kinetic Flow',
    description:
      'Fluidity in kinetic rhythm. Fabrics chosen for dynamic flow in wind and natural drape in stride.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    sortOrder: 2,
    productsCount: 2,
    translations: [
      {
        id: 't-3',
        language: 'id',
        name: 'MOTION — Kinetic Flow',
        description: 'Fluiditas ritme kinetik. Busana yang bergerak dinamis bersama langkah tubuh.',
      },
      {
        id: 't-4',
        language: 'en',
        name: 'MOTION — Kinetic Flow',
        description: 'Fluidity in kinetic rhythm. Fabrics chosen for dynamic flow in stride.',
      },
    ],
  },
  {
    id: 'col-identity',
    code: 'IDENTITY',
    slug: 'identity',
    name: 'IDENTITY — Raw Expression',
    description:
      'Raw cut details, modular fastenings, and unconventional proportions standing outside seasonal cycles.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    status: 'published',
    sortOrder: 3,
    productsCount: 2,
    translations: [
      {
        id: 't-5',
        language: 'id',
        name: 'IDENTITY — Raw Expression',
        description: 'Detail raw-cut, kancing modular, dan proporsi tak konvensional.',
      },
      {
        id: 't-6',
        language: 'en',
        name: 'IDENTITY — Raw Expression',
        description: 'Raw cut details, modular fastenings, and unconventional proportions.',
      },
    ],
  },
];

export const CollectionsListPage: React.FC = () => {
  const { t, format } = useAdminTranslation();
  const { token } = useAdminAuthStore();

  const [collections, setCollections] = useState<BackendCollection[]>(FALLBACK_COLLECTIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCollection, setSelectedCollection] = useState<BackendCollection | null>(null);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    const { data } = await adminGetCollections(token);
    setIsLoading(false);
    if (data && Array.isArray(data) && data.length > 0) {
      setCollections(data);
    }
  }, [token]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleEdit = (col: BackendCollection) => {
    setSelectedCollection(col);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCollection(null);
    setIsModalOpen(true);
  };

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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCollections}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleCreate}
          >
            {t.collections.createCapsuleBtn}
          </Button>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((col) => {
          const transId = col.translations?.find((tr) => tr.language === 'id');
          const displayName = transId?.name || col.name || col.code;
          const displayDesc = transId?.description || col.description || '';

          return (
            <Card key={col.id} className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative h-48 rounded-sm overflow-hidden border border-surface-border">
                  <img
                    src={col.coverImageUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800'}
                    alt={displayName}
                    className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={col.status === 'published' ? 'emerald' : 'amber'} size="sm">
                      {col.status === 'published' ? t.status.published : col.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="font-mono text-xs font-bold text-bone bg-black/70 px-2 py-1 rounded-sm border border-white/10 uppercase tracking-widest">
                      {col.code}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-sm font-bold text-bone uppercase tracking-wider">
                    {displayName}
                  </h3>
                  <p className="text-xs font-sans text-muted mt-1 leading-relaxed line-clamp-3">
                    {displayDesc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="font-mono text-xs text-muted">
                  {format(t.collections.corePiecesCount, {
                    count: col.productsCount ?? (col as any).piecesCount ?? 0,
                  })}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit3 className="w-3 h-3" />}
                    onClick={() => handleEdit(col)}
                  >
                    {t.collections.editBtn}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit & Create Modal */}
      <CollectionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collection={selectedCollection}
        onSuccess={fetchCollections}
      />
    </div>
  );
};
