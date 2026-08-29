import React from 'react';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAdminUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
        };

        const borderColors = {
          success: 'border-emerald-500/30 bg-surface-elevated',
          warning: 'border-amber-500/30 bg-surface-elevated',
          error: 'border-rose-500/30 bg-surface-elevated',
          info: 'border-cyan-500/30 bg-surface-elevated',
        };

        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-sm border shadow-2xl animate-in slide-in-from-bottom-3 duration-200',
              borderColors[toast.type]
            )}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-mono uppercase tracking-wider text-bone font-semibold">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-[11px] font-sans text-muted mt-0.5 break-words">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted hover:text-bone p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
