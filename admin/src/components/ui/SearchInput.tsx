import React from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  value,
  onChange,
  onClear,
  placeholder = 'Search by name, SKU, or keyword...',
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full">
      <Search className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={twMerge(
          clsx(
            'w-full bg-charcoal-dark border border-surface-border hover:border-surface-border-active text-bone text-xs font-sans rounded-sm pl-9 pr-8 py-2 placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent-lime focus:border-accent-lime transition-all',
            className
          )
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-2.5 text-muted hover:text-bone transition-colors p-0.5"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
