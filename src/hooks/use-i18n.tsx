'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Locale, defaultLocale, translations, type TranslationKeys } from '@/lib/i18n/translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof TranslationKeys) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem('fjboutique-locale') as Locale | null;
    if (saved && ['en', 'pt', 'zh'].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('fjboutique-locale', newLocale);
  }, []);

  const t = useCallback(
    (key: keyof TranslationKeys): string => {
      return translations[locale]?.[key] || translations[defaultLocale]?.[key] || key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
