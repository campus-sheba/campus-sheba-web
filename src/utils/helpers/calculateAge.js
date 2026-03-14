import moment from 'moment';

export function calculateAge(dob) {
  const birthDate = moment(dob, 'YYYY-MM-DD');
  const now = moment();

  const years = now.diff(birthDate, 'years');
  if (years >= 1) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  const months = now.diff(birthDate, 'months');
  if (months >= 1) {
    return months === 1 ? '1 month' : `${months} months`;
  }

  const days = now.diff(birthDate, 'days');
  return days === 1 ? '1 day' : `${days} days`;
}
