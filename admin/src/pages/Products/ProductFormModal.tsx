import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminCreateVariant,
  adminDeleteVariant,
  BackendAdminProduct,
  BackendCategory,
  BackendCollection,
  BackendProductImage,
} from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatIDR } from '@/lib/formatters';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: BackendAdminProduct | null;
  categories: BackendCategory[];
  collections: BackendCollection[];
  onSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  collections,
  onSuccess,
}) => {
  const { token } = useAdminAuthStore();
  const { addToast } = useAdminUIStore();

  const isEdit = Boolean(product);
  const [activeTab, setActiveTab] = useState<'basic' | 'localization' | 'media' | 'variants'>('basic');
  const [activeLangTab, setActiveLangTab] = useState<'id' | 'en'>('id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [skuRoot, setSkuRoot] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [basePriceIdr, setBasePriceIdr] = useState<number>(1250000);
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('active');
  const [featured, setFeatured] = useState(false);
  const [isNewDrop, setIsNewDrop] = useState(false);
  const [limitedRun, setLimitedRun] = useState(false);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');

  // Translations
  const [nameId, setNameId] = useState('');
  const [shortDescId, setShortDescId] = useState('');
  const [descId, setDescId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [provenanceId, setProvenanceId] = useState('');

  const [nameEn, setNameEn] = useState('');
  const [shortDescEn, setShortDescEn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [materialEn, setMaterialEn] = useState('');
  const [provenanceEn, setProvenanceEn] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Gallery
  const [galleryImages, setGalleryImages] = useState<BackendProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants
  const [variants, setVariants] = useState<
    Array<{
      id?: string;
      sku: string;
      colorName: string;
      colorCode: string;
      size: string;
      priceOverrideIdr?: number;
      initialStock?: number;
      status: 'active' | 'inactive';
    }>
  >([]);

  // New Variant Form
  const [varSku, setVarSku] = useState('');
  const [varColor, setVarColor] = useState('Obsidian Black');
  const [varColorCode, setVarColorCode] = useState('#0B0C0E');
  const [varSize, setVarSize] = useState('M');
  const [varStock, setVarStock] = useState(10);
  const [varPriceOverride, setVarPriceOverride] = useState('');

  // Populate on edit
  useEffect(() => {
    if (product) {
      setSkuRoot(product.skuRoot);
      setSlug(product.slug);
      setCategoryId(product.category?.id || (categories[0]?.id ?? ''));
      setCollectionId(product.collection?.id || '');
      setBasePriceIdr(product.basePriceIdr);
      setStatus(product.status);
      setFeatured(product.featured);
      setIsNewDrop(product.isNewDrop);
      setLimitedRun(product.limitedRun);
      setPrimaryImageUrl(product.primaryImageUrl || '');
      setTags(product.tags || []);
      setGalleryImages(product.images || []);

      const transId = product.translations?.find((t) => t.language === 'id');
      if (transId) {
        setNameId(transId.name || '');
        setShortDescId(transId.shortDescription || '');
        setDescId(transId.description || '');
        setMaterialId(transId.materialDescription || '');
        setProvenanceId(transId.provenanceText || '');
      }

      const transEn = product.translations?.find((t) => t.language === 'en');
      if (transEn) {
        setNameEn(transEn.name || '');
        setShortDescEn(transEn.shortDescription || '');
        setDescEn(transEn.description || '');
        setMaterialEn(transEn.materialDescription || '');
        setProvenanceEn(transEn.provenanceText || '');
      }

      setVariants(
        (product.variants || []).map((v) => ({
          id: v.id,
          sku: v.sku,
          colorName: v.colorName,
          colorCode: v.colorCode || '#000000',
          size: v.size,
          priceOverrideIdr: v.priceOverrideIdr || undefined,
          initialStock: v.stock || 0,
          status: v.status === 'inactive' ? 'inactive' : 'active',
        })),
      );
    } else {
      // Defaults for create
      setSkuRoot(`NV-${Date.now().toString().slice(-4)}`);
      setSlug('');
      setCategoryId(categories[0]?.id ?? '');
      setCollectionId(collections[0]?.id ?? '');
      setBasePriceIdr(1250000);
      setStatus('active');
      setFeatured(false);
      setIsNewDrop(true);
      setLimitedRun(false);
      setPrimaryImageUrl('https://images.unsplash.com/photo-1544441893-675973e31985');
      setTags(['atelier', 'new']);
      setNameId('Kemeja Atelier Kontemporer');
      setShortDescId('Siluet proporsional dengan draping fluid.');
      setDescId('Eksplorasi potongan avant-garde dari studio Bandung.');
      setMaterialId('100% Organic Japanese Cotton');
      setProvenanceId('Dibuat di Atelier Bandung.');
      setNameEn('Contemporary Atelier Shirt');
      setShortDescEn('Proportional silhouette with fluid drape.');
      setDescEn('Avant-garde tailoring exploration from Bandung atelier.');
      setMaterialEn('100% Organic Japanese Cotton');
      setProvenanceEn('Handcrafted at Bandung Atelier.');
      setVariants([
        {
          sku: `NV-${Date.now().toString().slice(-4)}-BLK-S`,
          colorName: 'Obsidian Black',
          colorCode: '#0B0C0E',
          size: 'S',
          initialStock: 6,
          status: 'active',
        },
        {
          sku: `NV-${Date.now().toString().slice(-4)}-BLK-M`,
          colorName: 'Obsidian Black',
          colorCode: '#0B0C0E',
          size: 'M',
          initialStock: 8,
          status: 'active',
        },
      ]);
    }
  }, [product, categories, collections, isOpen]);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setTags(tags.filter((t) => t !== tagName));
  };

  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (trimmed) {
      setGalleryImages([...galleryImages, { imageUrl: trimmed }]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, idx) => idx !== index));
  };

  const handleAddVariant = async () => {
    if (!varSku || !varColor || !varSize) {
      setErrorMsg('SKU, Warna, dan Ukuran varian wajib diisi');
      return;
    }

    const newV = {
      sku: varSku.trim().toUpperCase(),
      colorName: varColor.trim(),
      colorCode: varColorCode,
      size: varSize.trim().toUpperCase(),
      initialStock: Number(varStock) || 0,
      priceOverrideIdr: varPriceOverride ? Number(varPriceOverride) : undefined,
      status: 'active' as const,
    };

    if (isEdit && product) {
      // In edit mode, call direct create variant API
      setIsSubmitting(true);
      const { data, error } = await adminCreateVariant(token, product.id, newV);
      setIsSubmitting(false);

      if (error) {
        setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
        return;
      }

      if (data) {
        setVariants([...variants, { ...newV, id: data.id }]);
        addToast({
          type: 'success',
          title: 'Varian Ditambahkan',
          message: `SKU ${data.sku} berhasil disimpan.`,
        });
      }
    } else {
      // In create mode, append to local form state
      setVariants([...variants, newV]);
    }

    // Reset variant input
    setVarSku('');
    setVarPriceOverride('');
  };

  const handleDeleteVariant = async (index: number, variantId?: string) => {
    if (isEdit && variantId) {
      if (!window.confirm('Yakin ingin menghapus varian ini?')) return;
      setIsSubmitting(true);
      const { error } = await adminDeleteVariant(token, variantId);
      setIsSubmitting(false);

      if (error) {
        setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
        return;
      }

      addToast({
        type: 'info',
        title: 'Varian Dihapus',
        message: 'Varian telah dinonaktifkan/dihapus.',
      });
    }

    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!skuRoot || !nameId) {
      setErrorMsg('SKU Root dan Nama Produk (Indonesia) wajib diisi');
      return;
    }

    const calculatedSlug = slug || nameId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const translationsPayload = [
      {
        language: 'id' as const,
        name: nameId,
        shortDescription: shortDescId,
        description: descId,
        materialDescription: materialId,
        provenanceText: provenanceId,
      },
      {
        language: 'en' as const,
        name: nameEn || nameId,
        shortDescription: shortDescEn || shortDescId,
        description: descEn || descId,
        materialDescription: materialEn || materialId,
        provenanceText: provenanceEn || provenanceId,
      },
    ];

    setIsSubmitting(true);

    if (isEdit && product) {
      const updatePayload = {
        skuRoot,
        slug: calculatedSlug,
        categoryId: categoryId || undefined,
        collectionId: collectionId || null,
        basePriceIdr: Number(basePriceIdr),
        status,
        featured,
        isNewDrop,
        limitedRun,
        primaryImageUrl: primaryImageUrl || null,
        translations: translationsPayload.map((t) => ({
          language: t.language,
          name: t.name,
          shortDescription: t.shortDescription || undefined,
          description: t.description || undefined,
          materialDescription: t.materialDescription || undefined,
          provenanceText: t.provenanceText || undefined,
        })),
        tags: Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean))),
        images: galleryImages.map((img, idx) => ({
          imageUrl: img.imageUrl,
          altText: img.altText || undefined,
          sortOrder: img.sortOrder ?? idx,
          isPrimary: Boolean(img.isPrimary),
        })),
      };

      const { data, error } = await adminUpdateProduct(token, product.id, updatePayload);
      setIsSubmitting(false);

      if (error) {
        setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
        return;
      }

      if (data) {
        addToast({
          type: 'success',
          title: 'Produk Diperbarui',
          message: `${nameId} berhasil diperbarui di katalog atelier.`,
        });
        onSuccess();
        onClose();
      }
    } else {
      const createPayload = {
        skuRoot,
        slug: calculatedSlug,
        categoryId: categoryId || categories[0]?.id,
        collectionId: collectionId || undefined,
        basePriceIdr: Number(basePriceIdr),
        status,
        featured,
        isNewDrop,
        limitedRun,
        primaryImageUrl: primaryImageUrl || undefined,
        translations: translationsPayload,
        tags,
        images: galleryImages,
        variants,
      };

      const { data, error } = await adminCreateProduct(token, createPayload);
      setIsSubmitting(false);

      if (error) {
        setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
        return;
      }

      if (data) {
        addToast({
          type: 'success',
          title: 'Produk Dibuat',
          message: `${nameId} berhasil ditambahkan ke katalog atelier.`,
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
      title={isEdit ? `Edit Garment — ${skuRoot}` : 'Atelier Garment Formulation'}
      subtitle={isEdit ? 'Ubah metadata, lokalisasi, dan varian inventaris' : 'Formulasi produk baru ke katalog publik NOVAÉ'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-surface-border pb-2 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-1.5 rounded-sm transition-colors ${
              activeTab === 'basic'
                ? 'bg-accent-lime text-obsidian font-bold'
                : 'text-muted hover:text-bone hover:bg-white/5'
            }`}
          >
            1. Informasi Dasar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('localization')}
            className={`px-3 py-1.5 rounded-sm transition-colors ${
              activeTab === 'localization'
                ? 'bg-accent-lime text-obsidian font-bold'
                : 'text-muted hover:text-bone hover:bg-white/5'
            }`}
          >
            2. Lokalisasi (ID/EN)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3 py-1.5 rounded-sm transition-colors ${
              activeTab === 'media'
                ? 'bg-accent-lime text-obsidian font-bold'
                : 'text-muted hover:text-bone hover:bg-white/5'
            }`}
          >
            3. Media & Tag
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`px-3 py-1.5 rounded-sm transition-colors ${
              activeTab === 'variants'
                ? 'bg-accent-lime text-obsidian font-bold'
                : 'text-muted hover:text-bone hover:bg-white/5'
            }`}
          >
            4. Varian SKU ({variants.length})
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="SKU Root *"
                required
                placeholder="NV-JKT-001"
                value={skuRoot}
                onChange={(e) => setSkuRoot(e.target.value.toUpperCase())}
              />
              <Input
                label="Slug URL"
                placeholder="oversized-form-jacket"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Kategori *"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Select
                label="Koleksi"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                options={[
                  { value: '', label: '— Tanpa Koleksi —' },
                  ...collections.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <Select
                label="Status Produk"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { value: 'active', label: 'ACTIVE (Publik)' },
                  { value: 'draft', label: 'DRAFT (Internal)' },
                  { value: 'archived', label: 'ARCHIVED (Diarsipkan)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Harga Dasar (IDR) *"
                type="number"
                required
                value={basePriceIdr}
                onChange={(e) => setBasePriceIdr(Number(e.target.value))}
              />
              <Input
                label="Gambar Utama (Primary Image URL)"
                placeholder="https://images.unsplash.com/..."
                value={primaryImageUrl}
                onChange={(e) => setPrimaryImageUrl(e.target.value)}
              />
            </div>

            {/* Flags */}
            <div className="p-3 bg-charcoal-dark border border-surface-border rounded-sm flex flex-wrap gap-6 text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded bg-obsidian border-surface-border text-accent-lime focus:ring-0"
                />
                <span>Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isNewDrop}
                  onChange={(e) => setIsNewDrop(e.target.checked)}
                  className="rounded bg-obsidian border-surface-border text-accent-lime focus:ring-0"
                />
                <span>New Drop Badge</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={limitedRun}
                  onChange={(e) => setLimitedRun(e.target.checked)}
                  className="rounded bg-obsidian border-surface-border text-accent-lime focus:ring-0"
                />
                <span>Limited Run Atelier</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: LOCALIZATION */}
        {activeTab === 'localization' && (
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-surface-border pb-2">
              <button
                type="button"
                onClick={() => setActiveLangTab('id')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-sm transition-colors ${
                  activeLangTab === 'id'
                    ? 'bg-white/15 text-bone font-bold'
                    : 'text-muted hover:text-bone'
                }`}
              >
                🇮🇩 Bahasa Indonesia (Primary)
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-sm transition-colors ${
                  activeLangTab === 'en'
                    ? 'bg-white/15 text-bone font-bold'
                    : 'text-muted hover:text-bone'
                }`}
              >
                🇬🇧 English (Global)
              </button>
            </div>

            {activeLangTab === 'id' ? (
              <div className="space-y-3">
                <Input
                  label="Nama Produk (ID) *"
                  required
                  value={nameId}
                  onChange={(e) => setNameId(e.target.value)}
                  placeholder="Oversized Form Jacket"
                />
                <Input
                  label="Deskripsi Singkat (ID)"
                  value={shortDescId}
                  onChange={(e) => setShortDescId(e.target.value)}
                  placeholder="Jaket bervolume terstruktur dengan Japanese Selvedge Denim."
                />
                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-1">
                    Deskripsi Lengkap (ID)
                  </label>
                  <textarea
                    rows={3}
                    value={descId}
                    onChange={(e) => setDescId(e.target.value)}
                    className="w-full bg-charcoal border border-surface-border rounded-sm px-3 py-2 text-xs font-sans text-bone focus:outline-none focus:border-bone"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Material & Fabric (ID)"
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value)}
                    placeholder="14oz Japanese Raw Denim"
                  />
                  <Input
                    label="Asal & Provenance (ID)"
                    value={provenanceId}
                    onChange={(e) => setProvenanceId(e.target.value)}
                    placeholder="Dibuat di Bandung Atelier"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  label="Product Name (EN) *"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Oversized Form Jacket"
                />
                <Input
                  label="Short Description (EN)"
                  value={shortDescEn}
                  onChange={(e) => setShortDescEn(e.target.value)}
                  placeholder="Structured volume jacket in Japanese Selvedge Denim."
                />
                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-1">
                    Full Description (EN)
                  </label>
                  <textarea
                    rows={3}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full bg-charcoal border border-surface-border rounded-sm px-3 py-2 text-xs font-sans text-bone focus:outline-none focus:border-bone"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Material & Fabric (EN)"
                    value={materialEn}
                    onChange={(e) => setMaterialEn(e.target.value)}
                    placeholder="14oz Japanese Raw Denim"
                  />
                  <Input
                    label="Provenance (EN)"
                    value={provenanceEn}
                    onChange={(e) => setProvenanceEn(e.target.value)}
                    placeholder="Handcrafted in Bandung Atelier"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEDIA & TAGS */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Tags Section */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-muted">Product Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Tambahkan tag (e.g. Raw Denim, Oversized)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tags.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-sm text-xs font-mono text-bone"
                  >
                    <span>{tg}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tg)}
                      className="text-muted hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery Images Section */}
            <div className="space-y-3 pt-4 border-t border-surface-border">
              <label className="block text-xs font-mono uppercase text-muted">
                Galeri Gambar Produk ({galleryImages.length})
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="URL Foto Galeri (https://images.unsplash.com/...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddImage}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-sm overflow-hidden border border-surface-border bg-charcoal"
                  >
                    <img src={img.imageUrl} alt="Gallery" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VARIANTS */}
        {activeTab === 'variants' && (
          <div className="space-y-4">
            {/* Add Variant Form */}
            <div className="p-3.5 bg-charcoal-dark border border-surface-border rounded-sm space-y-3">
              <span className="text-xs font-mono uppercase text-accent-lime font-bold block">
                + Tambah Varian SKU Baru
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                <Input
                  label="SKU"
                  placeholder="NV-JKT-001-BLK-XL"
                  value={varSku}
                  onChange={(e) => setVarSku(e.target.value)}
                />
                <Input
                  label="Warna"
                  placeholder="Raw Indigo"
                  value={varColor}
                  onChange={(e) => setVarColor(e.target.value)}
                />
                <Input
                  label="Hex Warna"
                  placeholder="#1C2333"
                  value={varColorCode}
                  onChange={(e) => setVarColorCode(e.target.value)}
                />
                <Input
                  label="Ukuran"
                  placeholder="XL"
                  value={varSize}
                  onChange={(e) => setVarSize(e.target.value)}
                />
                <Input
                  label="Stok Awal"
                  type="number"
                  value={varStock}
                  onChange={(e) => setVarStock(Number(e.target.value))}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={handleAddVariant}
                    disabled={isSubmitting}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah
                  </Button>
                </div>
              </div>
            </div>

            {/* Variants Table */}
            {variants.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-muted border border-dashed border-surface-border rounded-sm">
                Belum ada varian SKU. Minimal tambahkan 1 varian agar produk dapat dipesan.
              </div>
            ) : (
              <div className="border border-surface-border rounded-sm overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-surface-border bg-charcoal text-muted uppercase text-[10px]">
                      <th className="p-2 text-left">SKU</th>
                      <th className="p-2 text-left">Warna</th>
                      <th className="p-2 text-left">Ukuran</th>
                      <th className="p-2 text-left">Harga Override</th>
                      <th className="p-2 text-left">Stok</th>
                      <th className="p-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-2 font-bold text-bone">{v.sku}</td>
                        <td className="p-2 flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: v.colorCode || '#000' }}
                          />
                          <span>{v.colorName}</span>
                        </td>
                        <td className="p-2 text-bone">{v.size}</td>
                        <td className="p-2 text-muted">
                          {v.priceOverrideIdr ? formatIDR(v.priceOverrideIdr) : '— (Base)'}
                        </td>
                        <td className="p-2 text-emerald-400 font-bold">{v.initialStock}</td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(idx, v.id)}
                            className="p-1 text-muted hover:text-rose-400"
                            title="Hapus Varian"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-surface-border">
          <span className="text-[10px] font-mono text-muted">
            NOVAÉ ATELIER v1.2 — Server Verified Write Operation
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Formulasi & Terbitkan'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
