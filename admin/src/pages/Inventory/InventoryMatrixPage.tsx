import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import {
  adminGetInventory,
  adminAdjustInventory,
  BackendInventoryItem,
  BackendInventorySummary,
} from '@/lib/api';
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
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { AdjustStockModal } from './AdjustStockModal';
import { MovementHistoryModal } from './MovementHistoryModal';
import {
  Boxes,
  Plus,
  Minus,
  SlidersHorizontal,
  History,
  RefreshCw,
} from 'lucide-react';

export const InventoryMatrixPage: React.FC = () => {
  const { token } = useAdminAuthStore();
  const { addToast } = useAdminUIStore();
  const { t, format } = useAdminTranslation();

  const [items, setItems] = useState<BackendInventoryItem[]>([]);
  const [summary, setSummary] = useState<BackendInventorySummary>({
    totalPieces: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [adjustModalItem, setAdjustModalItem] = useState<BackendInventoryItem | null>(null);
  const [historyModalItem, setHistoryModalItem] = useState<BackendInventoryItem | null>(null);
  const [quickAdjustingId, setQuickAdjustingId] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    const { data, error } = await adminGetInventory(token, {
      search: searchQuery.trim() || undefined,
      status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      limit: 100,
    });
    setIsLoading(false);

    if (error) {
      setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
    } else if (data) {
      setItems(data.data);
      setSummary(data.summary);
    }
  }, [token, searchQuery, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchInventory]);

  const handleQuickAdjust = async (item: BackendInventoryItem, amount: number) => {
    if (amount < 0 && item.availableQuantity <= 0) {
      addToast({
        type: 'error',
        title: 'Penyesuaian Ditolak',
        message: 'Stok tersedia sudah habis (0). Tidak dapat melakukan pengurangan stok lebih lanjut.',
      });
      return;
    }

    setQuickAdjustingId(item.id);
    const { data, error } = await adminAdjustInventory(token, item.variantId, {
      quantityDelta: amount,
      movementType: amount > 0 ? 'restock' : 'adjustment',
      note: amount > 0 ? 'Quick +1 Restock' : 'Quick -1 Adjustment',
      referenceType: 'quick_action',
    });
    setQuickAdjustingId(null);

    if (error) {
      addToast({
        type: 'error',
        title: 'Penyesuaian Gagal',
        message: Array.isArray(error.message) ? error.message.join(', ') : error.message,
      });
    } else if (data) {
      addToast({
        type: amount > 0 ? 'success' : 'warning',
        title: amount > 0 ? t.feedback.stockIncreased : t.feedback.stockDecreased,
        message: format(t.feedback.stockAdjustedDesc, {
          sign: amount > 0 ? '+' : '',
          amount,
          sku: item.sku,
        }),
      });
      fetchInventory();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.inventory.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.inventory.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {summary.outOfStockCount > 0 && (
            <Badge variant="rose" size="md">
              {summary.outOfStockCount} HABIS
            </Badge>
          )}
          <Badge variant="amber" size="md">
            {format(t.inventory.lowStockBadge, {
              count: summary.lowStockCount,
            })}
          </Badge>
          <Badge variant="emerald" size="md">
            {format(t.inventory.totalPiecesBadge, {
              count: summary.totalPieces,
            })}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInventory}
            disabled={isLoading}
            className="p-1.5 text-muted hover:text-bone"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface p-3.5 rounded-sm border border-surface-border">
        <div className="sm:col-span-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.inventory.searchPlaceholder}
          />
        </div>
        <div>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'ALL', label: t.inventory.allStockLevels },
              { value: 'IN_STOCK', label: t.inventory.inStockOption },
              { value: 'LOW_STOCK', label: t.inventory.lowStockOption },
              { value: 'OUT_OF_STOCK', label: t.inventory.outOfStockOption },
            ]}
          />
        </div>
      </div>

      {/* Error State */}
      {errorMsg ? (
        <ErrorState
          message={errorMsg}
          onRetry={fetchInventory}
        />
      ) : isLoading ? (
        /* Loading Skeleton */
        <div className="bg-surface rounded-sm border border-surface-border p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={<Boxes className="w-6 h-6" />}
          title={t.inventory.emptyTitle}
          description={t.inventory.emptyDesc}
          actionLabel={t.products.resetFilters}
          onAction={() => {
            setSearchQuery('');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        /* Inventory Table */
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t.inventory.skuCol}</TableHeaderCell>
              <TableHeaderCell>{t.inventory.garmentCol}</TableHeaderCell>
              <TableHeaderCell>{t.inventory.colorwayCol}</TableHeaderCell>
              <TableHeaderCell>{t.inventory.sizeCol}</TableHeaderCell>
              <TableHeaderCell>{t.inventory.physicalStockCol}</TableHeaderCell>
              <TableHeaderCell>{t.inventory.reservedCol}</TableHeaderCell>
              <TableHeaderCell>{t.inventory.availableCol}</TableHeaderCell>
              <TableHeaderCell>{t.inventory.healthStatusCol}</TableHeaderCell>
              <TableHeaderCell className="text-right">{t.inventory.adjustmentCol}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-[11px] font-bold text-bone">
                  {item.sku}
                </TableCell>
                <TableCell className="font-mono text-xs text-bone">
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.productName}</span>
                    {item.collection && (
                      <span className="text-[10px] text-muted">
                        {item.collection.code}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    {item.colorCode && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: item.colorCode }}
                        title={item.colorName}
                      />
                    )}
                    <span>{item.colorName}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-bone font-semibold">
                  {item.size}
                </TableCell>
                <TableCell className="font-mono text-xs tabular-nums text-bone">
                  {item.quantityOnHand}
                </TableCell>
                <TableCell className="font-mono text-xs tabular-nums text-muted">
                  {item.reservedQuantity}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold tabular-nums">
                  <span
                    className={
                      item.status === 'LOW_STOCK'
                        ? 'text-amber-400'
                        : item.status === 'OUT_OF_STOCK'
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }
                  >
                    {item.availableQuantity}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === 'IN_STOCK'
                        ? 'emerald'
                        : item.status === 'LOW_STOCK'
                        ? 'amber'
                        : 'rose'
                    }
                    size="sm"
                  >
                    {t.status[
                      item.status === 'IN_STOCK'
                        ? 'inStock'
                        : item.status === 'LOW_STOCK'
                        ? 'lowStock'
                        : 'outOfStock'
                    ]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleQuickAdjust(item, -1)}
                      disabled={quickAdjustingId === item.id || item.availableQuantity <= 0}
                      className="w-6 h-6 rounded-sm bg-white/5 hover:bg-white/10 text-muted hover:text-bone disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      title="Kurangi 1 (-1)"
                      aria-label="Decrease 1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(item, 1)}
                      disabled={quickAdjustingId === item.id}
                      className="w-6 h-6 rounded-sm bg-white/5 hover:bg-white/10 text-muted hover:text-bone disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      title="Tambah 1 (+1)"
                      aria-label="Increase 1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdjustModalItem(item)}
                      className="text-[10px] py-1 px-2 ml-1"
                      leftIcon={<SlidersHorizontal className="w-3 h-3" />}
                    >
                      Atur
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryModalItem(item)}
                      className="text-[10px] py-1 px-1.5 text-muted hover:text-bone"
                      title="Lihat Riwayat Mutasi Audit"
                      aria-label="Lihat Riwayat Mutasi Audit"
                    >
                      <History className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalItem && (
        <AdjustStockModal
          isOpen={true}
          item={adjustModalItem}
          onClose={() => setAdjustModalItem(null)}
          onSuccess={fetchInventory}
        />
      )}

      {/* Movement History Audit Modal */}
      {historyModalItem && (
        <MovementHistoryModal
          isOpen={true}
          item={historyModalItem}
          onClose={() => setHistoryModalItem(null)}
        />
      )}
    </div>
  );
};
