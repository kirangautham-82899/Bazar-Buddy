const LOCALE = 'en-IN';

export const formatRupees = (amount) => `₹${Number(amount || 0).toLocaleString(LOCALE)}`;

export const formatDateTime = (date) =>
  date ? new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(date) : '';

export const formatTime = (date) =>
  date ? new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' }).format(date) : '';

export const shortId = (id = '') => id.slice(-6).toUpperCase();

// Orders placed before the English-only switch stored names as { en, hi }.
export const itemName = (item) => (typeof item?.name === 'string' ? item.name : item?.name?.en || '');

export const formatAddress = (address) =>
  address ? [address.line1, address.area, address.city, address.pincode].filter(Boolean).join(', ') : '';
