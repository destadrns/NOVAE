import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { adminCreateCollection, adminUpdateCollection, BackendCollection } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface CollectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: BackendCollection | null;
  onSuccess: () => void;
}

export const CollectionFormModal: React.FC<CollectionFormModalProps> = ({
  isOpen,
  onClose,
  collection,
  onSuccess,
}) => {
  const { token } = useAdminAuthStore();
  const { addToast } = useAdminUIStore();

  const isEdit = Boolean(collection);
  const [activeLangTab, setActiveLangTab] = useState<'id' | 'en'>('id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [sortOrder, setSortOrder] = useState<number>(0);

  // Translations
  const [nameId, setNameId] = useState('');
  const [descId, setDescId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descEn, setDescEn] = useState('');

  useEffect(() => {
    if (collection) {
      setCode(collection.code || '');
      setSlug(collection.slug || '');
      setCoverImageUrl(collection.coverImageUrl || '');
      setStatus((collection.status as any) || 'published');
      setSortOrder(collection.sortOrder || 0);

      const transId = collection.translations?.find((t) => t.language === 'id');
      setNameId(transId?.name || collection.name || '');
      setDescId(transId?.description || collection.description || '');

      const transEn = collection.translations?.find((t) => t.language === 'en');
      setNameEn(transEn?.name || collection.name || '');
      setDescEn(transEn?.description || collection.description || '');
    } else {
      setCode('');
      setSlug('');
      setCoverImageUrl('https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop');
      setStatus('published');
      setSortOrder(0);
      setNameId('');
      setDescId('');
      setNameEn('');
      setDescEn('');
    }
    setErrorMsg('');
  }, [collection, isOpen]);

  // Auto-generate slug and code if empty in create mode
  const handleNameIdChange = (val: string) => {
    setNameId(val);
    if (!isEdit) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      setCode(val.split(' ')[0]?.toUpperCase() || 'CAPSULE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !slug.trim() || !nameId.trim()) {
      setErrorMsg('Code, Slug, dan Nama Koleksi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const translationsPayload = [
      {
        language: 'id' as const,
        name: nameId.trim(),
        description: descId.trim() || undefined,
      },
      {
        language: 'en' as const,
        name: (nameEn.trim() || nameId.trim()),
        description: (descEn.trim() || descId.trim()) || undefined,
      },
    ];

    const payload = {
      code: code.trim().toUpperCase(),
      slug: slug.trim().toLowerCase(),
      name: nameId.trim(),
      description: descId.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      status,
      sortOrder: Number(sortOrder) || 0,
      translations: translationsPayload,
    };

    if (isEdit && collection) {
      const { data, error } = await adminUpdateCollection(token, collection.id, payload);
      setIsSubmitting(false);

      if (error) {
        setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
        return;
      }

      if (data) {
        addToast({
          type: 'success',
          title: 'Koleksi Diperbarui',
          message: `Series ${payload.code} berhasil diperbarui di atelier database.`,
        });
        onSuccess();
        onClose();
      }
    } else {
      const { data, error } = await adminCreateCollection(token, payload);
      setIsSubmitting(false);

      if (error) {
        setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
        return;
      }

      if (data) {
        addToast({
          type: 'success',
          title: 'Koleksi Dibuat',
          message: `Series ${payload.code} berhasil ditambahkan ke katalog atelier.`,
        });
        onSuccess();
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`EDIT SERIES — ${collection?.code || ''}`}
      subtitle="Kelola narasi editorial, identitas visual, dan konten dwibahasa pilar koleksi atelier."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Simpan Perubahan
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-sm flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Kode Series (misal: FORM, MOTION, IDENTITY)"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="FORM"
          />

          <Input
            label="Slug URL (Path Navigasi)"
            required
            disabled
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="form"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status Publikasi"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { label: 'PUBLISHED (Aktif di Web)', value: 'published' },
              { label: 'DRAFT (Konsep Internal)', value: 'draft' },
              { label: 'ARCHIVED (Diarsipkan)', value: 'archived' },
            ]}
          />

          <Input
            label="Urutan Tampilan (Sort Order)"
            type="number"
            value={String(sortOrder)}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            placeholder="0"
          />
        </div>

        <Input
          label="URL Cover Image (Foto Sampul Series)"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        {coverImageUrl && (
          <div className="relative h-36 rounded-sm overflow-hidden border border-white/10 bg-black/40">
            <img
              src={coverImageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
            />
            <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 text-[10px] font-mono tracking-widest text-bone uppercase border border-white/10">
              Preview Sampul Series
            </span>
          </div>
        )}

        {/* Bilingual Tabs */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-widest text-muted">
              LOKALISASI TEKS EDITORIAL
            </label>
            <div className="flex items-center gap-1 bg-charcoal p-0.5 rounded-sm border border-white/10">
              <button
                type="button"
                onClick={() => setActiveLangTab('id')}
                className={`px-3 py-1 text-xs font-mono font-bold tracking-widest rounded-xs transition-all ${
                  activeLangTab === 'id'
                    ? 'bg-accent-lime text-obsidian shadow-sm'
                    : 'text-muted hover:text-bone'
                }`}
              >
                BAHASA (ID)
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`px-3 py-1 text-xs font-mono font-bold tracking-widest rounded-xs transition-all ${
                  activeLangTab === 'en'
                    ? 'bg-accent-lime text-obsidian shadow-sm'
                    : 'text-muted hover:text-bone'
                }`}
              >
                ENGLISH (EN)
              </button>
            </div>
          </div>

          {activeLangTab === 'id' ? (
            <div className="space-y-4">
              <Input
                label="Nama Series (ID)"
                required
                value={nameId}
                onChange={(e) => handleNameIdChange(e.target.value)}
                placeholder="FORM — Chapter 01"
              />
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                  Deskripsi / Narasi Series (ID)
                </label>
                <textarea
                  rows={4}
                  value={descId}
                  onChange={(e) => setDescId(e.target.value)}
                  placeholder="Eksplorasi siluet terstruktur dan arsitektur busana..."
                  className="w-full bg-charcoal-dark border border-surface-border rounded-sm p-3 text-xs text-bone font-sans placeholder:text-muted/50 focus:outline-none focus:border-accent-lime"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Series Title (EN)"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="FORM — Chapter 01"
              />
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                  Series Manifesto / Description (EN)
                </label>
                <textarea
                  rows={4}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="Architectural exploration of volume and structured silhouettes..."
                  className="w-full bg-charcoal-dark border border-surface-border rounded-sm p-3 text-xs text-bone font-sans placeholder:text-muted/50 focus:outline-none focus:border-accent-lime"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
