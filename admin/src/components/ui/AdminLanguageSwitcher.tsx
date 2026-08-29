import React from 'react';
import { useAdminLanguageStore } from '@/store/useAdminLanguageStore';
import { clsx } from 'clsx';
import { Globe } from 'lucide-react';

export interface AdminLanguageSwitcherProps {
  showIcon?: boolean;
  className?: string;
}

export const AdminLanguageSwitcher: React.FC<AdminLanguageSwitcherProps> = ({
  showIcon = true,
  className,
}) => {
  const { language, setLanguage } = useAdminLanguageStore();

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 bg-charcoal-dark border border-surface-border rounded-sm p-0.5 select-none',
        className
      )}
      role="group"
      aria-label="Language selector"
    >
      {showIcon && (
        <div className="pl-1.5 pr-1 text-muted">
          <Globe className="w-3 h-3 text-muted/80" />
        </div>
      )}
      <button
        type="button"
        onClick={() => setLanguage('id')}
        aria-pressed={language === 'id'}
        className={clsx(
          'px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150',
          language === 'id'
            ? 'bg-accent-lime text-obsidian shadow-sm'
            : 'text-muted hover:text-bone hover:bg-white/5'
        )}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={clsx(
          'px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150',
          language === 'en'
            ? 'bg-accent-lime text-obsidian shadow-sm'
            : 'text-muted hover:text-bone hover:bg-white/5'
        )}
      >
        EN
      </button>
    </div>
  );
};
