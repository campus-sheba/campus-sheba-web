export function formatPhoneNumber(rawPhone) {
  const phone = rawPhone.trim();
  if (phone.startsWith('0')) return `+88${phone}`;
  if (phone.startsWith('1')) return `+880${phone}`;
  if (phone.startsWith('+880')) return phone;
}
