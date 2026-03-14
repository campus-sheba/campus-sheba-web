'use client';
import { useLocale } from 'next-intl';

export function useLanguageCheck() {
  const locale = useLocale();
  const lang = locale.toUpperCase();

  return function (key, obj, fallback = '') {
    if (lang === 'EN') {
      return obj?.[key] ?? fallback;
    }

    const localizedKey = key + lang;

    return obj?.[localizedKey] || obj?.[key] || fallback;
  };
}
