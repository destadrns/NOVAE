import { create } from 'zustand';

export type Language = 'id' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const STORAGE_KEY = 'novae_language';

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'id';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'id' || saved === 'en') return saved;
  } catch (e) {
    // Ignore storage read errors
  }
  return 'id'; // Default Indonesian for first-time visitors
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // Ignore storage write errors
    }
    set({ language: lang });
  },
  toggleLanguage: () => {
    set((state) => {
      const nextLang = state.language === 'id' ? 'en' : 'id';
      try {
        localStorage.setItem(STORAGE_KEY, nextLang);
      } catch (e) {
        // Ignore storage write errors
      }
      return { language: nextLang };
    });
  },
}));
