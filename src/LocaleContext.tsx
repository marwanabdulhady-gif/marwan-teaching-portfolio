import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'en' | 'ar';

interface LocaleContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'nav.menu': 'Menu',
    'teach.creds.sr': 'Academic credentials and professional affiliations',
  },
  ar: {
    'nav.menu': 'القائمة',
    'teach.creds.sr': 'المؤهلات الأكاديمية والانتماءات المهنية',
  },
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('marwan_locale');
    if (saved === 'ar' || saved === 'en') return saved;
    return 'en';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('marwan_locale', newLocale);
  };

  const isRtl = locale === 'ar';

  useEffect(() => {
    // Apply dynamic dir attribute and class to body and html
    if (document && document.documentElement) {
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', locale);
      if (isRtl) {
        document.documentElement.classList.add('rtl-active');
        document.body.style.fontFamily = '"Cairo", "Tajawal", "Inter", sans-serif';
      } else {
        document.documentElement.classList.remove('rtl-active');
        document.body.style.fontFamily = '"DM Sans", sans-serif';
      }
    }
  }, [locale, isRtl]);

  const t = (key: string): string => {
    return translations[locale][key] || translations['en'][key] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isRtl, t }}>
      <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
