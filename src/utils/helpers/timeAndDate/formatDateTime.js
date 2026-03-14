//Formatting date DD-MM-YYYY
export function formatDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

//Formatting for UTC 0 to LocalTime (used for createdAt,updatedAt etc)
export function formatDateTime(isoString) {
  const date = new Date(isoString);

  // Extract date components
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();

  // Extract time components
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const amPm = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}-${month}-${year} ${formattedHours}:${minutes} ${amPm}`;
}

//Formatting for UTC 0  (used for my own entry data  etc)
export const formatUTCDateTime = isoString => {
  const date = new Date(isoString);

  // Ensure the date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';

  // Extract UTC date components
  const day = date.getUTCDate().toString().padStart(2, '0'); // Two-digit day
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Two-digit month
  const year = date.getUTCFullYear();

  // Extract UTC time components
  const hours = date.getUTCHours() % 12 || 12; // Convert 24-hour format to 12-hour
  const minutes = date.getUTCMinutes().toString().padStart(2, '0'); // Two-digit minutes
  const ampm = date.getUTCHours() >= 12 ? 'PM' : 'AM';

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};
