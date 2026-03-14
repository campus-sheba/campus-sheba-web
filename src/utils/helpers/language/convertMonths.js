import { convertNumberByLocale } from './convertNumbers';

const monthMaps = {
  bn: {
    Jan: 'জানু',
    Feb: 'ফেব',
    Mar: 'মার্চ',
    Apr: 'এপ্রি',
    May: 'মে',
    Jun: 'জুন',
    Jul: 'জুল',
    Aug: 'আগ',
    Sep: 'সেপ্টে',
    Oct: 'অক্টো',
    Nov: 'নভে',
    Dec: 'ডিসে',
  },
};

/**
 * Convert "MMM, YY" format to locale-specific format
 *
 * @param {string} formattedDate - e.g., "Aug, 25"
 * @param {string} locale - e.g., "bn", "en"
 * @returns {string} - e.g., "আগ, ২৫"
 */

export function convertMonthYearByLocale(formattedDate, locale) {
  const langCode = locale.split('-')[0];
  const [month, year] = formattedDate.split(', ').map(s => s.trim());

  const monthMap = monthMaps[langCode];
  const localizedMonth = monthMap ? monthMap[month] || month : month;
  const localizedYear = convertNumberByLocale(year, locale);

  return `${localizedMonth}, ${localizedYear}`;
}
