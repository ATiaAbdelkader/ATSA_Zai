import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../lib/i18n';
import { safeStorage } from '../lib/safe-storage';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // H8 fix: wrap localStorage in safeStorage so a Safari private-mode user
  // (or any env where localStorage throws) doesn't white-screen the entire
  // app on first render.
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = safeStorage.get('atsa_language') as Language | null;
    return (saved === 'en' || saved === 'fr' || saved === 'ar') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeStorage.set('atsa_language', lang);
  };

  useEffect(() => {
    const currentDir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = currentDir;
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) {
      // M12 fix: warn in dev so missing-translation bugs surface instead
      // of silently rendering the key string.
      const isDev = (import.meta as any).env?.DEV;
      if (isDev) {
        console.warn('[i18n] missing key:', key);
      }
      return key;
    }
    return entry[language] || entry['en'] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
