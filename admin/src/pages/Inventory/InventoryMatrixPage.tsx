import React, { useState } from 'react';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
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
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Boxes, Plus, Minus, RefreshCw } from 'lucide-react';

export const InventoryMatrixPage: React.FC = () => {
  const { inventory, adjustStock } = useAdminDataStore();
  const { addToast } = useAdminUIStore();
  const { t, format } = useAdminTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Restock modal state
  const [restockModalItem, setRestockModalItem] = useState<typeof inventory[0] | null>(null);
  const [restockAmount, setRestockAmount] = useState(10);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleQuickAdjust = (id: string, sku: string, amount: number) => {
    adjustStock(id, amount);
    addToast({
      type: amount > 0 ? 'success' : 'warning',
      title: amount > 0 ? t.feedback.stockIncreased : t.feedback.stockDecreased,
      message: format(t.feedback.stockAdjustedDesc, {
        sign: amount > 0 ? '+' : '',
        amount,
        sku,
      }),
    });
  };

  const handleBatchRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;
    adjustStock(restockModalItem.id, Number(restockAmount));
    addToast({
      type: 'success',
      title: t.feedback.batchRestockSuccess,
      message: format(t.feedback.batchRestockDesc, {
        amount: restockAmount,
        sku: restockModalItem.sku,
      }),
    });
    setRestockModalItem(null);
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
        <div className="flex items-center gap-2">
          <Badge variant="amber" size="md">
            {format(t.inventory.lowStockBadge, {
              count: inventory.filter((i) => i.status === 'LOW_STOCK').length,
            })}
          </Badge>
          <Badge variant="emerald" size="md">
            {format(t.inventory.totalPiecesBadge, {
              count: inventory.reduce((acc, i) => acc + i.stock, 0),
            })}
          </Badge>
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

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
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
            {filteredInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-[11px] font-bold text-bone">
                  {item.sku}
                </TableCell>
                <TableCell className="font-mono text-xs text-bone">
                  {item.productName}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted">
                  {item.color}
                </TableCell>
                <TableCell className="font-mono text-xs text-bone font-semibold">
                  {item.size}
                </TableCell>
                <TableCell className="font-mono text-xs tabular-nums text-bone">
                  {item.stock}
                </TableCell>
                <TableCell className="font-mono text-xs tabular-nums text-muted">
                  {item.reserved}
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
                    {item.available}
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
                      onClick={() => handleQuickAdjust(item.id, item.sku, -1)}
                      className="w-6 h-6 rounded-sm bg-white/5 hover:bg-white/10 text-muted hover:text-bone flex items-center justify-center transition-colors"
                      title="Decrease 1"
                      aria-label="Decrease 1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(item.id, item.sku, 1)}
                      className="w-6 h-6 rounded-sm bg-white/5 hover:bg-white/10 text-muted hover:text-bone flex items-center justify-center transition-colors"
                      title="Increase 1"
                      aria-label="Increase 1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRestockModalItem(item);
                        setRestockAmount(10);
                      }}
                      className="text-[10px] py-1 px-2 ml-1"
                    >
                      {t.inventory.batchBtn}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Batch Restock Modal */}
      {restockModalItem && (
        <Modal
          isOpen={true}
          onClose={() => setRestockModalItem(null)}
          title={format(t.inventory.batchModalTitle, { sku: restockModalItem.sku })}
          subtitle={format(t.inventory.batchModalSubtitle, {
            productName: restockModalItem.productName,
            color: restockModalItem.color,
            size: restockModalItem.size,
          })}
          maxWidth="md"
        >
          <form onSubmit={handleBatchRestock} className="space-y-4">
            <div className="p-3 bg-charcoal-dark border border-surface-border rounded-sm text-xs font-mono grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted block">{t.inventory.currentStock}</span>
                <span className="text-bone font-bold">
                  {restockModalItem.stock} {t.dashboard.unitsSold.toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted block">{t.inventory.availableToSell}</span>
                <span className="text-emerald-400 font-bold">
                  {restockModalItem.available} {t.dashboard.unitsSold.toLowerCase()}
                </span>
              </div>
            </div>

            <Input
              label={t.inventory.additionalUnits}
              type="number"
              min="1"
              required
              value={restockAmount}
              onChange={(e) => setRestockAmount(Number(e.target.value))}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRestockModalItem(null)}
              >
                {t.inventory.cancelBtn}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                {t.inventory.confirmRestockBtn}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
