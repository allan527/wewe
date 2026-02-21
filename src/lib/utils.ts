export const formatUGX = (amount: number) => `UGX ${amount.toLocaleString('en-UG')}`;

export const maskPhoneNumber = (phone: string) => `${phone.slice(0, 4)} XXX XXX`;

export const normalizePhone = (raw: string) => {
  let phone = raw.replace(/\s+/g, '');
  if (phone.startsWith('+256')) phone = `0${phone.slice(4)}`;
  if (phone.startsWith('256')) phone = `0${phone.slice(3)}`;
  if (!/^0\d{9}$/.test(phone)) throw new Error('Phone must be 10 digits and start with 0');
  return phone;
};

export const formatDate = (d: Date) => {
  const dd = `${d.getDate()}`.padStart(2, '0');
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

export const parseDate = (s: string) => {
  const [dd, mm, yyyy] = s.split('/').map(Number);
  return new Date(yyyy, mm - 1, dd);
};

export const addDays = (date: string, days: number) => {
  const d = parseDate(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const uid = () => crypto.randomUUID();
