import React from 'react';
import { AlertTriangle, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'warning' | 'info' | 'success' | 'danger';
  title?: string;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  className,
  type = 'info',
  title,
  children,
  onDismiss,
  ...props
}) => {
  const styles = {
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
  };

  const icons = {
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    danger: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  return (
    <div
      className={twMerge(
        clsx(
          'flex items-start gap-3 p-3.5 rounded-sm border text-xs font-sans',
          styles[type],
          className
        )
      )}
      role="alert"
      {...props}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-mono uppercase tracking-wider font-semibold mb-0.5 text-bone">
            {title}
          </h4>
        )}
        <div className="text-muted leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-muted hover:text-bone p-1 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
