import { create } from 'zustand';

export type AdminLanguage = 'id' | 'en';

interface AdminLanguageState {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  toggleLanguage: () => void;
}

const STORAGE_KEY = 'novae_admin_language';

const getInitialLanguage = (): AdminLanguage => {
  if (typeof window === 'undefined') return 'id';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'id' || saved === 'en') return saved;
  } catch (e) {
    // Ignore storage read error
  }
  return 'id'; // Default Indonesian for first-time visitors
};

export const useAdminLanguageStore = create<AdminLanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // Ignore storage write error
    }
    set({ language: lang });
  },
  toggleLanguage: () => {
    set((state) => {
      const nextLang = state.language === 'id' ? 'en' : 'id';
      try {
        localStorage.setItem(STORAGE_KEY, nextLang);
      } catch (e) {
        // Ignore storage write error
      }
      return { language: nextLang };
    });
  },
}));
