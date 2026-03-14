import { convertNumberByLocale } from './convertNumbers';

/**
 * Converts time in "hh:mm AM/PM" format to locale-specific format
 * Supports Bangla conversion for digits and time period (AM/PM)
 *
 * @param {string} time - e.g., "11:30 PM"
 * @param {string} locale - e.g., "bn", "en"
 * @returns {string} - e.g., "রাত ১১:৩০" for Bangla, "11:30 PM" for English
 */
export function convertTimeToLocale(time, locale) {
  const langCode = locale.split('-')[0];

  const [timePart, period] = time.trim().split(' '); // e.g., "11:30", "PM"
  const [hourStr, minuteStr] = timePart.split(':');
  const hour = parseInt(hourStr, 10);

  let translatedPeriod = period;

  if (langCode === 'bn') {
    // Bangla period translation
    if (period === 'AM') {
      if (hour < 6) translatedPeriod = 'ভোর';
      else translatedPeriod = 'সকাল';
    } else if (period === 'PM') {
      if (hour === 12) translatedPeriod = 'দুপুর';
      else if (hour < 5) translatedPeriod = 'দুপুর';
      else if (hour < 8) translatedPeriod = 'বিকেল';
      else translatedPeriod = 'রাত';
    }

    const localizedHour = convertNumberByLocale(hourStr, locale);
    const localizedMinute = convertNumberByLocale(minuteStr, locale);
    return `${translatedPeriod} ${localizedHour}:${localizedMinute}`;
  }

  // English or other locales
  return `${hourStr}:${minuteStr} ${period}`;
}
