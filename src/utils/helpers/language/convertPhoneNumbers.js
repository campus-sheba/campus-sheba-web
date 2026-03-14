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
  // Add other locales here
};

/**
 * Convert phone number digits to the appropriate locale script.
 * Keeps symbols like + - () as-is.
 *
 * @param {string|number} phoneNumber
 * @param {string} locale - Example: 'bn-BD', 'en-US'
 * @returns {string}
 */
export function convertPhoneNumberByLocale(phoneNumber, locale) {
  if (!phoneNumber) return '';

  const numberStr = phoneNumber.toString();
  const langCode = locale.split('-')[0];
  const digitMap = digitMaps[langCode];

  if (!digitMap) return numberStr;

  return numberStr
    .split('')
    .map(char => (/\d/.test(char) ? digitMap[char] : char))
    .join('');
}
