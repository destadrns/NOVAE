import React from 'react';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { AlertTriangle, Plus, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminLowStockAlert, adminAdjustStock } from '@/lib/api';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';

interface LowStockAlertsProps {
  alerts?: AdminLowStockAlert[];
  isLoading?: boolean;
  onRestocked?: () => void;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({
  alerts = [],
  isLoading = false,
  onRestocked,
}) => {
  const { token } = useAdminAuthStore();
  const { addToast } = useAdminUIStore();
  const { t, format } = useAdminTranslation();

  const handleQuickRestock = async (item: AdminLowStockAlert) => {
    const { error } = await adminAdjustStock(token, {
      variantId: item.variantId,
      movementType: 'restock',
      quantityDelta: 5,
      note: 'Quick restock from dashboard alerts',
    });

    if (error) {
      addToast({
        type: 'error',
        title: 'Restock Failed',
        message: Array.isArray(error.message) ? error.message.join(', ') : error.message,
      });
      return;
    }

    addToast({
      type: 'success',
      title: t.feedback.stockUpdated,
      message: format(t.feedback.stockAdjustedDesc, {
        sign: '+',
        amount: 5,
        sku: item.sku,
      }),
    });

    if (onRestocked) {
      onRestocked();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-center items-center text-center min-h-[280px]">
        <Loader2 className="w-6 h-6 text-accent-lime animate-spin mb-2" />
        <p className="text-xs font-mono text-muted uppercase tracking-wider">
          {t.dashboard.lowStockTitle}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-bone font-semibold flex items-center gap-2">
            <span>{t.dashboard.lowStockTitle}</span>
            {alerts.length > 0 && (
              <Badge variant="amber" size="sm">
                {format(t.dashboard.actionReqBadge, { count: alerts.length })}
              </Badge>
            )}
          </h3>
          <p className="text-[11px] font-sans text-muted mt-0.5">
            {t.dashboard.lowStockSubtitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-center text-xs font-mono text-muted gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{t.dashboard.allStockHealthy}</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-sm bg-charcoal border border-surface-border hover:border-amber-500/30 transition-all text-xs"
              >
                <div className="min-w-0 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h4 className="font-mono text-[11px] text-bone font-semibold truncate max-w-[160px] sm:max-w-[220px]">
                      {item.productName}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted mt-0.5 flex-wrap">
                      <span className="text-muted/80">{item.sku}</span>
                      <span>•</span>
                      <span className="text-amber-300 font-semibold">
                        {format(t.dashboard.leftPiece, {
                          count: item.available,
                          threshold: item.threshold,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRestock(item)}
                  leftIcon={<Plus className="w-3 h-3" />}
                  className="shrink-0 text-[10px] py-1.5 px-2.5 min-h-[32px] sm:min-h-0"
                >
                  {t.dashboard.restockBtn}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
