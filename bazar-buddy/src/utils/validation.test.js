import { isValidPhone, normalizePhone, validateAuthForm } from './validation';

describe('phone numbers', () => {
  it('accepts Indian mobile numbers in common formats', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('+91 98765 43210')).toBe(true);
    expect(normalizePhone('098765-43210')).toBe('9876543210');
  });

  it('rejects short or landline-style numbers', () => {
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('1234567890')).toBe(false);
  });
});

describe('validateAuthForm', () => {
  const valid = { name: 'Ravi', email: 'ravi@example.com', password: 'secret1', phone: '9876543210' };

  it('passes a valid registration', () => {
    expect(validateAuthForm(valid, false)).toEqual({});
  });

  it('only checks email and password on login', () => {
    expect(validateAuthForm({ ...valid, name: '', phone: '' }, true)).toEqual({});
  });

  it('reports each invalid field with a translation key', () => {
    expect(validateAuthForm({ name: ' ', email: 'nope', password: '123', phone: '1' }, false)).toEqual({
      name: 'errNameRequired',
      email: 'errInvalidEmail',
      password: 'errWeakPassword',
      phone: 'errPhone',
    });
  });
});
