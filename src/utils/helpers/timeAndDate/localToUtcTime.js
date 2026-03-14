// localToUTC.js
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function localToUtcTime(localDateTime) {
  return dayjs.tz(localDateTime, 'YYYY-MM-DD HH:mm:ss', dayjs.tz.guess()).utc().toISOString();
}

export function localDateTimeToUtc(date, time) {
  if (!date || !time) return null;

  const combined = `${date} ${time}`;
  const localTz = dayjs.tz.guess();

  let parsed = dayjs.tz(combined, 'YYYY-MM-DD HH:mm', localTz);

  if (!parsed.isValid()) {
    parsed = dayjs.tz(combined, 'YYYY-MM-DD h:mm A', localTz);
  }

  if (!parsed.isValid()) {
    console.error('Invalid datetime:', { date, time, combined });
    return null;
  }

  return parsed.utc().toISOString();
}
