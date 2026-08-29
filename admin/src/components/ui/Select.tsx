import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, children, error, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-mono uppercase tracking-widest text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={twMerge(
              clsx(
                'w-full appearance-none bg-charcoal-dark border text-bone text-xs font-sans rounded-sm pl-3 pr-8 py-2 transition-all focus:outline-none focus:ring-1 focus:ring-accent-lime focus:border-accent-lime cursor-pointer',
                error
                  ? 'border-rose-500/50 focus:ring-rose-500'
                  : 'border-surface-border hover:border-surface-border-active',
                className
              )
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-charcoal text-bone">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
        {error && <p className="text-[10px] font-mono text-rose-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
