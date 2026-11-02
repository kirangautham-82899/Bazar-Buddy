import translations, { translate } from './translations';

const placeholders = (text) => (text.match(/\{\w+\}/g) || []).sort();

describe('translations', () => {
  const en = Object.keys(translations.en).sort();
  const hi = Object.keys(translations.hi).sort();

  it('has every key in both languages', () => {
    expect(hi).toEqual(en);
  });

  it('uses the same placeholders in both languages', () => {
    en.forEach((key) => {
      expect([key, placeholders(translations.hi[key])]).toEqual([key, placeholders(translations.en[key])]);
    });
  });

  it('fills placeholders and falls back to English', () => {
    expect(translate('en', 'greeting', { name: 'Ravi' })).toBe('Namaste, Ravi');
    expect(translate('xx', 'login')).toBe('Login');
    expect(translate('hi', 'missingKey')).toBe('missingKey');
  });
});
