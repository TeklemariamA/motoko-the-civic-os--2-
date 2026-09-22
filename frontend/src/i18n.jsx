import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './locales/index.js';

export { translations };

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', flag: '🇷🇺' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', dir: 'ltr', flag: '🇪🇹' }
];

const I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (path) => path,
  dir: 'ltr',
  currentLangMeta: SUPPORTED_LANGUAGES[0]
});

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('civic_os_lang');
    if (saved && translations[saved]) return saved;
    const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (translations[browserLang]) return browserLang;
  } catch (e) {
    console.warn('Could not read saved language', e);
  }
  return 'en';
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem('civic_os_lang', lang);
      } catch (e) {
        console.warn('Could not persist language', e);
      }
    }
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const dir = currentLangMeta.dir;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
  }, [language, dir]);

  // Key path traversal helper: e.g. t('tabs.Chat') or t('ckbtc.balance', { balance })
  const t = (path, paramsOrFallback, maybeFallback) => {
    let params = null;
    let fallback = undefined;

    if (paramsOrFallback !== null && typeof paramsOrFallback === 'object') {
      params = paramsOrFallback;
      fallback = maybeFallback;
    } else if (typeof paramsOrFallback === 'string') {
      fallback = paramsOrFallback;
    }

    const resolvePath = (obj, p) => {
      if (!obj || typeof obj !== 'object') return undefined;
      const parts = p.split('.');
      let cur = obj;
      for (const part of parts) {
        if (cur && typeof cur === 'object' && part in cur) {
          cur = cur[part];
        } else {
          return undefined;
        }
      }
      return cur;
    };

    let result = resolvePath(translations[language], path);
    if (result === undefined) {
      result = resolvePath(translations.en, path);
    }
    if (result === undefined) {
      result = fallback !== undefined ? fallback : path;
    }

    if (typeof result === 'string' && params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replaceAll(`{${k}}`, v).replaceAll(`{{${k}}}`, v);
      }
    }
    return result;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir, currentLangMeta }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);

export const LanguageSelector = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="cursor-pointer appearance-none rounded bg-blue-700/80 hover:bg-blue-800 text-white text-xs font-semibold py-1.5 pl-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-white border border-blue-400/30 transition-colors"
        aria-label="Select Language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-gray-900 bg-white">
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 text-white/80 text-[10px]">
        ▼
      </span>
    </div>
  );
};
