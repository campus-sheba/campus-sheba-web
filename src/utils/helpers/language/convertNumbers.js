const digitMaps = {
  bn: {
    0: '০',
    1: '১',
    2: '২',
    3: '৩',
    4: '৪',
    5: '৫',
    6: '৬',
    7: '৭',
    8: '৮',
    9: '৯',
  },
};

/**
 * Convert English digits to locale-specific digits
 * Supports full numbers or single digits as string or number
 *
 * @param {string|number} number - The English number to convert (e.g., "123", 123, "5", 5)
 * @param {string} locale - Target locale ('bn', 'en', 'bn-BD', 'en-US', etc.)
 * @returns {string} - Locale-specific formatted number
 */
export function convertNumberByLocale(number, locale) {
  if (number === null || number === undefined) {
    return '0'; // or return '0', or whatever default you want
  }

  const numberStr = number.toString();
  const langCode = locale?.split('-')[0];

  const digitMap = digitMaps[langCode];

  if (!digitMap) {
    // If the locale isn't supported, return as-is
    return numberStr;
  }

  return numberStr
    .split('')
    .map(digit => digitMap[digit] || digit)
    .join('');
}
