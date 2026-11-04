// @vitest-environment node
// Every t('key') in the code must exist, and every string must be used somewhere.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import strings, { t } from './strings';
import starterCatalog from '../data/starterCatalog';
import markets from '../data/mandis';

const SRC = path.resolve(__dirname, '..');
const sourceFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(js|jsx)$/.test(name) && !/\.test\./.test(name) && name !== 'strings.js' ? [full] : [];
  });
const code = sourceFiles(SRC).map((f) => readFileSync(f, 'utf8')).join('\n');

// Keys built at runtime, e.g. t(`faq${n}q`) or t(`${speed}Desc`).
const DYNAMIC = /^(faq\d[qa]|(express|scheduled|saver)Desc|step\d(Title|Body)|feat\d(Title|Body))$/;

describe('strings', () => {
  it('fills placeholders', () => {
    expect(t('placeOrder', { total: 340 })).toBe('Place order · ₹340');
    expect(t('missingKey')).toBe('missingKey');
  });

  it('has no unused strings', () => {
    const unused = Object.keys(strings).filter((key) => !DYNAMIC.test(key) && !new RegExp(`['"\`]${key}['"\`]`).test(code));
    expect(unused).toEqual([]);
  });

  it('defines every key used with t()', () => {
    const used = [...code.matchAll(/\bt\(\s*'([A-Za-z0-9]+)'/g)].map((m) => m[1]);
    const missing = [...new Set(used)].filter((key) => !(key in strings));
    expect(missing).toEqual([]);
  });

  it('contains no Hindi text', () => {
    expect(Object.values(strings).join(' ')).not.toMatch(/[ऀ-ॿ]/);
  });
});

// Everything shoppers read is plain English: no "mandi" and no Hindi words.
const NOT_ENGLISH = /(mandis?|sabzi|sabji|kirana|pyaa?z|aloo|tamatar|mirchi?|tadka|chaat|chai|paneer|toor|daal?|atta|besan|haldi|nimbu|namak|doodh|sarson|kela|gajar|samiti|galla|krishi|chakki|rotis?|parathas?)/i;

describe('plain English', () => {
  it('uses no mandi or Hindi words in the interface, products or market names', () => {
    const texts = [
      ...Object.values(strings),
      ...starterCatalog.flatMap((p) => [p.name, p.description, ...(p.keywords || [])]),
      ...markets.map((m) => m.name),
    ];
    expect(texts.filter((text) => NOT_ENGLISH.test(text))).toEqual([]);
  });
});
