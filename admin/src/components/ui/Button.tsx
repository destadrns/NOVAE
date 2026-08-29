import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-accent-lime text-obsidian font-semibold hover:bg-accent-lime-hover shadow-[0_0_20px_rgba(216,255,0,0.15)] hover:shadow-[0_0_25px_rgba(216,255,0,0.3)]',
      secondary:
        'bg-surface-elevated hover:bg-surface-hover text-bone border border-surface-border hover:border-surface-border-active',
      outline:
        'bg-transparent hover:bg-white/5 text-bone border border-white/15 hover:border-white/30',
      ghost:
        'bg-transparent hover:bg-white/5 text-muted hover:text-bone',
      danger:
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-sm tracking-wider uppercase font-mono',
      md: 'text-xs px-3.5 py-2 gap-2 rounded-sm tracking-wider uppercase font-mono',
      lg: 'text-sm px-5 py-2.5 gap-2.5 rounded-sm tracking-wider uppercase font-mono font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
