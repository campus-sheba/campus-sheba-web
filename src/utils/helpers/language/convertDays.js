const dayMaps = {
  bn: {
    Sun: 'রবি',
    Mon: 'সোম',
    Tue: 'মঙ্গল',
    Wed: 'বুধ',
    Thu: 'বৃহস্পতি',
    Fri: 'শুক্র',
    Sat: 'শনি',
  },
};
/**
 * Convert English day abbreviation to locale-specific day name
 *
 * @param {string} day - 3-letter English day name (e.g., "Mon", "Tue")
 * @param {string} locale - Target locale ('bn', 'en', etc.)
 * @returns {string} - Translated day name
 */
export function convertDayByLocale(day, locale) {
  const langCode = locale.split('-')[0];
  const dayMap = dayMaps[langCode];

  if (!dayMap) {
    return day; // Return original if unsupported locale
  }

  return dayMap[day] || day;
}
