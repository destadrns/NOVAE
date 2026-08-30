import React, { useState } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { adminAdjustInventory, BackendInventoryItem } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw, Plus, Minus, Check } from 'lucide-react';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BackendInventoryItem | null;
  onSuccess: () => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  const { token } = useAdminAuthStore();
  const { addToast, triggerBadgeRefresh } = useAdminUIStore();
  const { t, format } = useAdminTranslation();

  const [movementType, setMovementType] = useState<string>('restock');
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [quantity, setQuantity] = useState<number>(10);
  const [note, setNote] = useState<string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    item?.lowStockThreshold ?? 3,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLargeDecreaseConfirm, setShowLargeDecreaseConfirm] = useState(false);

  if (!item) return null;

  const currentOnHand = item.quantityOnHand;
  const currentReserved = item.reservedQuantity;
  const currentAvailable = item.availableQuantity;

  const calculatedDelta = direction === 'increase' ? Math.abs(quantity) : -Math.abs(quantity);
  const resultingOnHand = currentOnHand + calculatedDelta;
  const resultingAvailable = resultingOnHand - currentReserved;

  const isCriticalReduction =
    direction === 'decrease' && resultingAvailable <= item.lowStockThreshold;

  const executeAdjustment = async () => {
    setIsSubmitting(true);
    setShowLargeDecreaseConfirm(false);
    const { data, error } = await adminAdjustInventory(token, item.variantId, {
      quantityDelta: calculatedDelta,
      movementType,
      note: note.trim() || undefined,
      lowStockThreshold: Number(lowStockThreshold),
      referenceType: 'manual_adjustment',
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
      return;
    }

    if (data) {
      addToast({
        type: calculatedDelta > 0 ? 'success' : 'warning',
        title: calculatedDelta > 0 ? t.feedback.stockIncreased : t.feedback.stockDecreased,
        message: format(t.feedback.stockAdjustedDesc, {
          sign: calculatedDelta > 0 ? '+' : '',
          amount: calculatedDelta,
          sku: item.sku,
        }),
      });
      triggerBadgeRefresh();
      onSuccess();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (calculatedDelta === 0) {
      setErrorMsg('Jumlah penyesuaian (delta) tidak boleh bernilai 0.');
      return;
    }

    if (resultingOnHand < 0) {
      setErrorMsg(
        `Penyesuaian ditolak: stok fisik tidak boleh bernilai negatif (Hasil: ${resultingOnHand}).`,
      );
      return;
    }

    if (resultingAvailable < 0) {
      setErrorMsg(
        `Penyesuaian ditolak: stok tersedia tidak boleh kurang dari jumlah yang dipesan (${currentReserved} unit dipesan).`,
      );
      return;
    }

    if (direction === 'decrease' && Math.abs(calculatedDelta) >= 10) {
      setShowLargeDecreaseConfirm(true);
      return;
    }

    await executeAdjustment();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={format(t.inventory.batchModalTitle, { sku: item.sku })}
      subtitle={format(t.inventory.batchModalSubtitle, {
        productName: item.productName,
        color: item.colorName,
        size: item.size,
      })}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current State Indicator */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-charcoal-dark border border-surface-border rounded-sm text-xs font-mono">
          <div>
            <span className="text-[10px] text-muted block uppercase">Stok Fisik</span>
            <span className="text-bone font-bold">{currentOnHand} unit</span>
          </div>
          <div>
            <span className="text-[10px] text-muted block uppercase">Dipesan</span>
            <span className="text-amber-400 font-bold">{currentReserved} unit</span>
          </div>
          <div>
            <span className="text-[10px] text-muted block uppercase">Tersedia</span>
            <span
              className={`font-bold ${
                currentAvailable <= 0
                  ? 'text-rose-400'
                  : currentAvailable <= item.lowStockThreshold
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {currentAvailable} unit
            </span>
          </div>
        </div>

        {/* Movement Direction Toggle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-muted uppercase">
            Arah Penyesuaian Stok
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setDirection('increase');
                if (movementType === 'adjustment') setMovementType('restock');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm border text-xs font-mono transition-colors ${
                direction === 'increase'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-charcoal border-surface-border text-muted hover:text-bone'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Stok (+)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection('decrease');
                setMovementType('adjustment');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm border text-xs font-mono transition-colors ${
                direction === 'decrease'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                  : 'bg-charcoal border-surface-border text-muted hover:text-bone'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Kurangi Stok (-)</span>
            </button>
          </div>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipe Mutasi Inventaris"
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            options={[
              { value: 'restock', label: 'Restock / Batch Baru' },
              { value: 'adjustment', label: 'Koreksi Stok Fisik' },
              { value: 'return', label: 'Retur Pelanggan' },
              { value: 'purchase', label: 'Inbound PO' },
              { value: 'sale', label: 'Pengeluaran Manual' },
            ]}
          />
          <Input
            label="Besar Unit Penyesuaian"
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(Math.abs(Number(e.target.value)))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Catatan Audit / Alasan"
            placeholder="misal: Batch pengiriman studio Bandung..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Input
            label="Batas Peringatan (Low Stock Threshold)"
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
          />
        </div>

        {/* Resulting Preview */}
        <div className="p-3 bg-charcoal rounded-sm border border-surface-border space-y-1 text-xs font-mono">
          <div className="flex justify-between items-center text-muted">
            <span>Perubahan Delta:</span>
            <span className={calculatedDelta > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {calculatedDelta > 0 ? `+${calculatedDelta}` : calculatedDelta} unit
            </span>
          </div>
          <div className="flex justify-between items-center text-bone font-semibold">
            <span>Proyeksi Stok Akhir (Tersedia):</span>
            <span
              className={
                resultingAvailable <= 0
                  ? 'text-rose-400'
                  : resultingAvailable <= lowStockThreshold
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }
            >
              {resultingOnHand} fisik ({resultingAvailable} siap jual)
            </span>
          </div>
        </div>

        {isCriticalReduction && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Peringatan: Pengurangan ini akan memicu status Peringatan Stok Menipis / Habis.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            {t.inventory.cancelBtn}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            leftIcon={isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Menyimpan...' : 'Terapkan Penyesuaian'}
          </Button>
        </div>
      </form>

      {/* Large Stock Reduction Confirmation Modal */}
      {showLargeDecreaseConfirm && (
        <ConfirmModal
          isOpen={showLargeDecreaseConfirm}
          onClose={() => setShowLargeDecreaseConfirm(false)}
          onConfirm={executeAdjustment}
          title="Konfirmasi Pengurangan Stok Besar"
          itemName={`SKU: ${item.sku}`}
          description={`Anda akan mengurangi stok sebanyak ${Math.abs(calculatedDelta)} unit. Apakah Anda yakin ingin menerapkan perubahan inventaris ini?`}
          confirmLabel="Terapkan Pengurangan"
          cancelLabel="Batal"
          variant="warning"
          isLoading={isSubmitting}
        />
      )}
    </Modal>
  );
};
