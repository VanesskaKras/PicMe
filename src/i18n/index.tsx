import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { uk } from './uk';

export type Lang = 'en' | 'uk';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Українська' },
];

// English source strings are the keys; other languages map them to translations.
// Anything missing from a dictionary (e.g. user-written text) falls back to the key itself.
const DICTIONARIES: Record<Lang, Record<string, string>> = { en: {}, uk };

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem('picme_lang');
    if (saved === 'en' || saved === 'uk') return saved;
    if (navigator.language?.toLowerCase().startsWith('uk')) return 'uk';
  } catch (e) {
    // fall through to English
  }
  return 'en';
}

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(loadLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem('picme_lang', next);
    } catch (e) {
      // language still applies for this session
    }
  }, []);

  const t = useCallback<TFunction>(
    (key, vars) => {
      let text = DICTIONARIES[lang][key] ?? key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.split(`{${name}}`).join(String(value));
        }
      }
      return text;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
