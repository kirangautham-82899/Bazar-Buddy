const locale = (lang) => (lang === 'hi' ? 'hi-IN' : 'en-IN');

export const formatRupees = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export const formatDateTime = (date, lang) =>
  date
    ? new Intl.DateTimeFormat(locale(lang), {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)
    : '';

export const formatDate = (date, lang) =>
  date ? new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short' }).format(date) : '';

export const shortId = (id = '') => id.slice(-6).toUpperCase();

export const productName = (product, lang) => product?.name?.[lang] || product?.name?.en || '';
