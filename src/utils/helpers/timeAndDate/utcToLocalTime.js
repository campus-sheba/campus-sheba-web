// utcToLocalTime.js
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function utcToLocalTime(utcTime, format = 'HH:mm:ss') {
  const today = dayjs().format('YYYY-MM-DD');
  const combined = `${today}T${utcTime}Z`; // Treat as full UTC ISO string

  return dayjs.utc(combined).tz(dayjs.tz.guess()).format(format);
}

export function utcToLocalTime12Hour(utcTime, format = 'hh:mm A') {
  const today = dayjs().format('YYYY-MM-DD');
  const combined = `${today}T${utcTime}Z`; // Treat as full UTC ISO string

  return dayjs.utc(combined).tz(dayjs.tz.guess()).format(format);
}

export const utcToLocalTimeConvert = time => {
  // return dayjs.utc(time, "HH:mm").local().format("hh:mm A");
  const utcTime = dayjs.utc(time, 'HH:mm');
  if (!time || !utcTime.isValid()) {
    return dayjs().format('hh:mm A'); // fallback to current local time
  }
  return utcTime.local().format('hh:mm A');
};

export const utcToLocalDateConvert = (date, time) => {
  // const utcDateTime = dayjs.utc(`${date} ${time}`, "YYYY-MM-DD HH:mm");
  // return utcDateTime.local().format("YYYY-MM-DD");
  const combined = `${date} ${time}`;
  const utcDateTime = dayjs.utc(combined, 'YYYY-MM-DD HH:mm');
  if (!date || !time || !utcDateTime.isValid()) {
    return dayjs().format('YYYY-MM-DD'); // fallback to current local date
  }
  return utcDateTime.local().format('YYYY-MM-DD');
};

export const utcIsoToLocalDateTimeFormatted = isoString => {
  return dayjs.utc(isoString).local().format('DD-MM-YYYY hh:mm A');
};

export const convertUtcToLocalIsoString = isoString => {
  const localTime = dayjs.utc(isoString).local();
  return localTime.format('YYYY-MM-DDTHH:mm:ss[Z]');
};
