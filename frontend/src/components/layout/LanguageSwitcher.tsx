import React from 'react';
import { useLanguageStore, Language } from '@/store/useLanguageStore';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { language, setLanguage } = useLanguageStore();

  const handleSelect = (lang: Language) => {
    if (language !== lang) {
      setLanguage(lang);
    }
  };

  if (variant === 'expanded') {
    return (
      <div className={`flex items-center gap-2 font-mono text-xs ${className}`}>
        <button
          onClick={() => handleSelect('id')}
          className={`px-3 py-1.5 border transition-all duration-300 ${
            language === 'id'
              ? 'border-accent-lime bg-accent-lime/10 text-bone font-bold shadow-[0_0_12px_rgba(216,255,0,0.2)]'
              : 'border-white/10 text-muted hover:text-bone hover:border-white/30'
          }`}
          aria-label="Pilih Bahasa Indonesia"
        >
          ID (Bahasa)
        </button>
        <button
          onClick={() => handleSelect('en')}
          className={`px-3 py-1.5 border transition-all duration-300 ${
            language === 'en'
              ? 'border-accent-lime bg-accent-lime/10 text-bone font-bold shadow-[0_0_12px_rgba(216,255,0,0.2)]'
              : 'border-white/10 text-muted hover:text-bone hover:border-white/30'
          }`}
          aria-label="Select English Language"
        >
          EN (English)
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language Selector"
      className={`inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded-sm ${className}`}
    >
      <button
        onClick={() => handleSelect('id')}
        className={`px-1.5 py-0.5 transition-colors relative ${
          language === 'id'
            ? 'text-accent-lime font-bold'
            : 'text-muted hover:text-bone'
        }`}
        aria-pressed={language === 'id'}
        aria-label="Bahasa Indonesia"
      >
        ID
      </button>
      <span className="text-white/20 select-none text-[10px]">/</span>
      <button
        onClick={() => handleSelect('en')}
        className={`px-1.5 py-0.5 transition-colors relative ${
          language === 'en'
            ? 'text-accent-lime font-bold'
            : 'text-muted hover:text-bone'
        }`}
        aria-pressed={language === 'en'}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};
