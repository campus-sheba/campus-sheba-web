import { convertNumberByLocale } from './convertNumbers';

const timeUnitMaps = {
  bn: {
    hour: 'ঘণ্টা',
    hours: 'ঘণ্টা',
    min: 'মিনিট',
    mins: 'মিনিট',
    minute: 'মিনিট',
    minutes: 'মিনিট',
    day: 'দিন',
    days: 'দিন',
    month: 'মাস',
    months: 'মাস',
    year: 'বছর',
    years: 'বছর',
  },
};

/**
 * Convert duration text to locale-specific format
 *
 * @param {string} duration - e.g., "1 hour", "1 hour 20 mins", "20 mins", "2 months 5 days"
 * @param {string} locale - e.g., "bn", "en"
 * @returns {string} - e.g., "১ ঘণ্টা", "১ ঘণ্টা ২০ মিনিট", "২ মাস ৫ দিন"
 */
export function convertDurationByLocale(duration, locale) {
  if (typeof duration !== 'string' || duration.trim() === '') {
    return '';
  }

  const langCode = locale.split('-')[0];
  const unitMap = timeUnitMaps[langCode] || {};

  return duration
    .split(' ')
    .map(part => {
      if (!isNaN(part)) {
        return convertNumberByLocale(part, locale);
      }
      const lowerPart = part.toLowerCase();
      return unitMap[lowerPart] || part;
    })
    .join(' ');
}
