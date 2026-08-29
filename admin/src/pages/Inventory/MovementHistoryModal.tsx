import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import {
  adminGetInventoryMovements,
  BackendInventoryItem,
  BackendInventoryMovement,
} from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/LoadingSkeleton';
import { History, ArrowUpRight, ArrowDownRight, User, Clock, AlertCircle } from 'lucide-react';

interface MovementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BackendInventoryItem | null;
}

export const MovementHistoryModal: React.FC<MovementHistoryModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { token } = useAdminAuthStore();
  const [movements, setMovements] = useState<BackendInventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !item) return;

    let isMounted = true;
    const fetchMovements = async () => {
      setIsLoading(true);
      setErrorMsg('');
      const { data, error } = await adminGetInventoryMovements(token, item.variantId);
      if (!isMounted) return;
      setIsLoading(false);

      if (error) {
        setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
      } else if (data) {
        setMovements(data);
      }
    };

    fetchMovements();
    return () => {
      isMounted = false;
    };
  }, [isOpen, item, token]);

  if (!item) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'restock':
      case 'purchase':
        return <Badge variant="emerald" size="sm">{type.toUpperCase()}</Badge>;
      case 'adjustment':
        return <Badge variant="muted" size="sm">KOREKSI</Badge>;
      case 'return':
        return <Badge variant="amber" size="sm">RETUR</Badge>;
      case 'sale':
        return <Badge variant="rose" size="sm">PENJUALAN</Badge>;
      case 'reservation':
        return <Badge variant="amber" size="sm">RESERVASI</Badge>;
      case 'release':
        return <Badge variant="emerald" size="sm">PELEPASAN</Badge>;
      default:
        return <Badge variant="muted" size="sm">{type.toUpperCase()}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Riwayat Mutasi Stok // ${item.sku}`}
      subtitle={`${item.productName} • ${item.colorName} • Ukuran ${item.size}`}
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Quick Summary Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-charcoal-dark border border-surface-border rounded-sm text-xs font-mono">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-muted block uppercase">Stok Fisik</span>
              <span className="text-bone font-bold">{item.quantityOnHand} unit</span>
            </div>
            <div>
              <span className="text-[10px] text-muted block uppercase">Siap Jual</span>
              <span className="text-emerald-400 font-bold">{item.availableQuantity} unit</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted block uppercase">Ambang Batas</span>
            <span className="text-bone font-bold">{item.lowStockThreshold} unit</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-4 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            icon={<History className="w-6 h-6 text-muted" />}
            title="Belum Ada Riwayat Mutasi"
            description="Belum ada transaksi atau penyesuaian stok yang tercatat untuk varian SKU ini."
          />
        ) : (
          <div className="space-y-2">
            {movements.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-surface hover:bg-surface-elevated/50 transition-colors border border-surface-border rounded-sm text-xs font-mono space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getMovementBadge(m.movementType)}
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(m.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 font-bold text-sm tabular-nums ${
                      m.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {m.quantityDelta > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>
                      {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                    </span>
                  </div>
                </div>

                {m.note && (
                  <p className="text-xs text-bone/90 bg-charcoal-dark/50 p-1.5 rounded-sm border border-surface-border/50">
                    "{m.note}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-muted" />
                    {m.createdByName || m.createdByEmail || 'Sistem Atelier'}
                  </span>
                  {m.referenceType && (
                    <span className="uppercase text-muted/80">Ref: {m.referenceType}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
