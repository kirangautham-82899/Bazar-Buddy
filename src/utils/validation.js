const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian mobile numbers

// Keeps the last 10 digits so "+91 98765 43210" and "09876543210" both work.
export const normalizePhone = (phone = '') => phone.replace(/\D/g, '').slice(-10);

export const isValidEmail = (email = '') => EMAIL_RE.test(email.trim());

export const isValidPhone = (phone) => PHONE_RE.test(normalizePhone(phone));

// Returns { field: translationKey } for every invalid field.
export const validateProfileFields = ({ name = '', phone = '' }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'errNameRequired';
  if (!isValidPhone(phone)) errors.phone = 'errPhone';
  return errors;
};

export const validateAuthForm = ({ name, email, password, phone }, isLogin) => ({
  ...(isLogin ? {} : validateProfileFields({ name, phone })),
  ...(isValidEmail(email) ? {} : { email: 'errInvalidEmail' }),
  ...(password.length >= 6 ? {} : { password: 'errWeakPassword' }),
});
