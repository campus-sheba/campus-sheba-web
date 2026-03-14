import dayjs from 'dayjs';

export const convertUtcToLocalIsoString = isoString => {
  const localTime = dayjs.utc(isoString).local();
  return localTime.format('YYYY-MM-DDTHH:mm:ss[Z]');
};
