'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from '../lib/routing';

type Locale = 'zh' | 'en';

const LOCALE_KEY = 'app-locale';

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('zh');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_KEY) as Locale;
    if (savedLocale && (savedLocale === 'zh' || savedLocale === 'en')) {
      setLocale(savedLocale);
    }
  }, []);

  const switchLocale = useCallback((newLocale: Locale) => {
    if (newLocale === locale) return;
    
    setLocale(newLocale);
    localStorage.setItem(LOCALE_KEY, newLocale);
    router.replace(pathname, { locale: newLocale });
  }, [locale, router, pathname]);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    switchLocale(newLocale);
  }, [locale, switchLocale]);

  return {
    locale,
    switchLocale,
    toggleLocale,
    isZh: locale === 'zh',
    isEn: locale === 'en'
  };
}
