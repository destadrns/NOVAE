import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import {
  adminGetProducts,
  adminArchiveProduct,
  adminGetCategories,
  adminGetCollections,
  BackendAdminProduct,
  BackendCategory,
  BackendCollection,
} from '@/lib/api';
import { formatIDR, formatDate } from '@/lib/formatters';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ProductFormModal } from './ProductFormModal';
import { Plus, Eye, Edit3, Trash2, Package, RefreshCw, AlertCircle } from 'lucide-react';

export const ProductsListPage: React.FC = () => {
  const { token } = useAdminAuthStore();
  const { addToast } = useAdminUIStore();
  const { t, format } = useAdminTranslation();

  const [products, setProducts] = useState<BackendAdminProduct[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [collections, setCollections] = useState<BackendCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCollection, setSelectedCollection] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BackendAdminProduct | null>(null);
  const [inspectProduct, setInspectProduct] = useState<BackendAdminProduct | null>(null);

  // Fetch Categories & Collections
  useEffect(() => {
    async function loadMeta() {
      const [catRes, colRes] = await Promise.all([
        adminGetCategories(token),
        adminGetCollections(token),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (colRes.data) setCollections(colRes.data);
    }
    loadMeta();
  }, [token]);

  // Load Products
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');

    const { data, error } = await adminGetProducts(token, {
      search: searchQuery || undefined,
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      collection: selectedCollection !== 'ALL' ? selectedCollection : undefined,
      status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      limit: 50,
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
      return;
    }

    if (data) {
      setProducts(data.data);
    }
  }, [token, searchQuery, selectedCategory, selectedCollection, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Handle Archive / Delete
  const handleArchive = async (id: string, name: string) => {
    if (window.confirm(`Arsipkan produk "${name}" dari katalog publik?`)) {
      const { error } = await adminArchiveProduct(token, id);
      if (error) {
        addToast({
          type: 'error',
          title: 'Gagal Mengarsipkan',
          message: Array.isArray(error.message) ? error.message.join(', ') : error.message,
        });
        return;
      }

      addToast({
        type: 'info',
        title: t.feedback.productDeleted,
        message: format(t.feedback.productDeletedDesc, { name }),
      });
      loadProducts();
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (prod: BackendAdminProduct) => {
    setEditingProduct(prod);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.products.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.products.subtitle} — {products.length} Garment Models Loaded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadProducts}
            disabled={isLoading}
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            {t.products.addNewProduct}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-3 bg-surface p-3.5 rounded-sm border border-surface-border">
        <div>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.products.searchPlaceholder}
          />
        </div>
        <div>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'ALL', label: t.products.allCategories },
              ...categories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
        </div>
        <div>
          <Select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            options={[
              { value: 'ALL', label: t.products.allCollections },
              ...collections.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
        </div>
        <div>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'ALL', label: 'Semua Status' },
              { value: 'active', label: 'Active (Publik)' },
              { value: 'draft', label: 'Draft (Internal)' },
              { value: 'archived', label: 'Archived (Arsip)' },
            ]}
          />
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-muted animate-pulse bg-charcoal border border-surface-border rounded-sm">
          MEMUAT KATALOG ATELIER...
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title={t.products.emptyTitle}
          description={t.products.emptyDesc}
          actionLabel={t.products.resetFilters}
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('ALL');
            setSelectedCollection('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t.products.garmentDetailsCol}</TableHeaderCell>
              <TableHeaderCell>{t.products.collectionCol}</TableHeaderCell>
              <TableHeaderCell>{t.products.categoryCol}</TableHeaderCell>
              <TableHeaderCell>{t.products.priceCol}</TableHeaderCell>
              <TableHeaderCell>{t.products.totalStockCol}</TableHeaderCell>
              <TableHeaderCell>{t.products.statusCol}</TableHeaderCell>
              <TableHeaderCell className="text-right">{t.products.actionsCol}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((prod) => {
              const displayImage =
                prod.primaryImageUrl ||
                prod.images?.[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1544441893-675973e31985';

              return (
                <TableRow key={prod.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={displayImage}
                        alt={prod.name}
                        className="w-10 h-12 object-cover rounded-sm border border-surface-border shrink-0 bg-charcoal"
                      />
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-semibold text-bone truncate">
                          {prod.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted truncate max-w-xs">
                          {prod.skuRoot} • {prod.variantsCount} varian
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 text-bone">
                      {prod.collection?.code || 'ATELIER'}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted">
                    {prod.category?.name || 'Garment'}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold tabular-nums text-bone">
                    {formatIDR(prod.basePriceIdr)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        prod.totalStock <= 5 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {prod.totalStock} {t.dashboard.piecesInStock.toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        prod.status === 'active'
                          ? 'emerald'
                          : prod.status === 'draft'
                          ? 'amber'
                          : 'muted'
                      }
                      size="sm"
                    >
                      {prod.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setInspectProduct(prod)}
                        className="p-1.5 text-muted hover:text-bone hover:bg-white/5 rounded-sm transition-colors"
                        title={t.products.inspectTitle}
                        aria-label={t.products.inspectTitle}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 text-muted hover:text-accent-lime hover:bg-white/5 rounded-sm transition-colors"
                        title="Edit Produk"
                        aria-label="Edit Produk"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(prod.id, prod.name)}
                        className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors"
                        title={t.products.deleteTitle}
                        aria-label={t.products.deleteTitle}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Add / Edit Product Modal */}
      {isFormModalOpen && (
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          product={editingProduct}
          categories={categories}
          collections={collections}
          onSuccess={loadProducts}
        />
      )}

      {/* Inspect Product Modal */}
      {inspectProduct && (
        <Modal
          isOpen={true}
          onClose={() => setInspectProduct(null)}
          title={inspectProduct.name}
          subtitle={`SKU Root: ${inspectProduct.skuRoot} • Slug: ${inspectProduct.slug}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={
                  inspectProduct.primaryImageUrl ||
                  inspectProduct.images?.[0]?.imageUrl ||
                  'https://images.unsplash.com/photo-1544441893-675973e31985'
                }
                alt={inspectProduct.name}
                className="w-24 h-32 object-cover rounded-sm border border-surface-border bg-charcoal shrink-0"
              />
              <div className="space-y-1.5 text-xs font-sans">
                <p className="font-mono text-base font-bold text-bone">
                  {formatIDR(inspectProduct.basePriceIdr)}
                </p>
                <p className="text-muted leading-relaxed">
                  {inspectProduct.translations?.find((t) => t.language === 'id')?.description ||
                    inspectProduct.translations?.[0]?.description ||
                    'Deskripsi belum ditambahkan.'}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="lime" size="sm">
                    {inspectProduct.collection?.code || 'NO COLLECTION'}
                  </Badge>
                  <Badge variant="muted" size="sm">
                    {inspectProduct.category?.name || 'Category'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Variants inspection */}
            <div className="space-y-2 pt-2 border-t border-surface-border">
              <span className="text-xs font-mono uppercase text-muted block">
                Daftar Varian SKU ({inspectProduct.variants?.length || 0})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {inspectProduct.variants?.map((v) => (
                  <div
                    key={v.id}
                    className="p-2 bg-charcoal-dark border border-surface-border rounded-sm text-xs font-mono space-y-1"
                  >
                    <div className="font-bold text-bone">{v.sku}</div>
                    <div className="text-muted text-[10px]">
                      {v.colorName} • Size {v.size}
                    </div>
                    <div className="text-emerald-400 font-bold text-[10px]">
                      Stok: {v.stock} pcs
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-sm bg-charcoal-dark border border-surface-border text-xs font-mono">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block">
                  {t.products.createdDateMeta}
                </span>
                <span className="text-bone">{formatDate(inspectProduct.createdAt)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block">
                  {t.products.totalStockMeta}
                </span>
                <span className="text-emerald-400 font-bold">
                  {inspectProduct.totalStock} {t.dashboard.piecesInStock.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
