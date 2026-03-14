// utils/timeHelpers.js
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getLocalDateFromUTC(utcString, format = 'YYYY-MM-DD') {
  return dayjs.utc(utcString).tz(dayjs.tz.guess()).format(format);
}

export function getLocalTimeFromUTC(utcString, format = 'hh:mm A') {
  return dayjs.utc(utcString).tz(dayjs.tz.guess()).format(format);
}
