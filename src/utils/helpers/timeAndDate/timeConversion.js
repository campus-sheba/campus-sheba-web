import dayjs from 'dayjs';
import moment from 'moment';

/**
 * Converts 12-hour format (e.g., "2:30 PM") to 24-hour format (e.g., "14:30")
 * @param {string} time12h - Time string in 12-hour format
 * @returns {string} Time in 24-hour format
 */
export const convert12To24 = time12h => {
  return moment(time12h, ['h:mm A']).format('HH:mm');
};

/**
 * Converts 24-hour format (e.g., "14:30") to 12-hour format (e.g., "2:30 PM")
 * @param {string} time24h - Time string in 24-hour format
 * @returns {string} Time in 12-hour format
 */
export const convert24To12 = time24h => {
  return moment(time24h, 'HH:mm').format('h:mm A');
};

export function extractTime(dayjsObj) {
  return dayjsObj.format('HH:mm'); // e.g., "14:59"
}

export function toDayjsTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = dayjs(); // today’s date
  return now.hour(hours).minute(minutes).second(0).millisecond(0);
}
