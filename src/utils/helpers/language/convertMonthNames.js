const monthNames = {
  bn: [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

/**
 * Convert English month name to locale-specific month name
 *
 * @param {string} monthName - English month name ('January', 'February', etc.)
 * @param {string} locale - Target locale ('bn', 'en', 'bn-BD', etc.)
 * @returns {string} - Localized month name, or empty string if not found
 */
export function convertMonthToLocale(monthName, locale) {
  if (!monthName || !locale) return '';

  const langCode = locale.split('-')[0];
  const targetMonths = monthNames[langCode];
  if (!targetMonths) return '';

  // Find index of English month
  const monthIndex = monthNames.en.findIndex(
    m => m.toLowerCase() === monthName.trim().toLowerCase()
  );

  return monthIndex !== -1 ? targetMonths[monthIndex] : '';
}
