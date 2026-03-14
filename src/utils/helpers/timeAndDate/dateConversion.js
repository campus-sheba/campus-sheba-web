import dayjs from 'dayjs';
import moment from 'moment';

export function formatDateToYMD(dateString) {
  return moment(dateString).format('YYYY-MM-DD');
}

export function extractDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toISOStringFromDateOnly(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // JS months are 0-indexed
  return date.toISOString(); // returns UTC ISO string
}

export function toDayjsObject(dateString) {
  return dayjs(dateString);
}
