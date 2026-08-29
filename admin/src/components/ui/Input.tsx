import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-mono uppercase tracking-widest text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted pointer-events-none shrink-0 flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                'w-full bg-charcoal-dark border text-bone text-xs font-sans rounded-sm px-3 py-2 transition-all placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent-lime focus:border-accent-lime',
                leftIcon ? 'pl-9' : '',
                rightIcon ? 'pr-9' : '',
                error
                  ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-surface-border hover:border-surface-border-active',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-muted shrink-0 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[10px] font-mono text-rose-400">{error}</p>}
        {!error && helperText && (
          <p className="text-[10px] font-mono text-muted/70">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
