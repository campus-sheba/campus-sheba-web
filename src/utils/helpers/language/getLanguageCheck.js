import { getLocale } from 'next-intl/server';

export async function getLanguageCheck(key, obj, fallback = '') {
  const locale = await getLocale();
  const lang = locale.toUpperCase();
  if (lang === 'EN') {
    return obj?.[key] ?? fallback;
  }

  const localizedKey = key + lang;

  return obj?.[localizedKey] || obj?.[key] || fallback;
}
