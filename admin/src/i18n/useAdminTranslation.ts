import { useAdminLanguageStore, AdminLanguage } from '@/store/useAdminLanguageStore';
import { adminTranslations } from './adminTranslations';

export function useAdminTranslation() {
  const { language, setLanguage, toggleLanguage } = useAdminLanguageStore();
  const t = adminTranslations[language];

  const format = (template: string, vars: Record<string, string | number>) => {
    let result = template;
    for (const [key, val] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }
    return result;
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
    format,
  };
}

export type { AdminLanguage };
