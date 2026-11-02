import starterCatalog from '../data/starterCatalog';
import { levenshtein, normalize, searchProducts } from './search';

const ids = (list) => list.map((p) => p.id);

describe('normalize', () => {
  it('lowercases and strips punctuation', () => {
    expect(normalize('  Tomatoes!! ')).toBe('tomatoes');
    expect(normalize('Chaat-pack (5 kg)')).toBe('chaat pack 5 kg');
  });
});

describe('levenshtein', () => {
  it('counts single edits', () => {
    expect(levenshtein('tomato', 'tomato')).toBe(0);
    expect(levenshtein('tomato', 'tomoto')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
  });
});

describe('searchProducts', () => {
  it('returns everything for an empty query', () => {
    expect(searchProducts(starterCatalog, '   ')).toHaveLength(starterCatalog.length);
  });

  it('matches English names and Hinglish keywords', () => {
    expect(ids(searchProducts(starterCatalog, 'tomato'))[0]).toBe('tomato');
    expect(ids(searchProducts(starterCatalog, 'pyaz'))[0]).toBe('onion');
    expect(ids(searchProducts(starterCatalog, 'aloo'))[0]).toBe('potato');
  });

  it('tolerates small typos', () => {
    expect(ids(searchProducts(starterCatalog, 'tomatos'))).toContain('tomato');
    expect(ids(searchProducts(starterCatalog, 'potatoe'))).toContain('potato');
  });

  it('matches by prefix while typing', () => {
    expect(ids(searchProducts(starterCatalog, 'gar'))).toContain('garlic');
  });

  it('requires every word to match', () => {
    expect(ids(searchProducts(starterCatalog, 'mustard oil'))).toEqual(['mustard-oil']);
  });

  it('ranks exact matches above combos that mention the item', () => {
    const results = ids(searchProducts(starterCatalog, 'onion'));
    expect(results[0]).toBe('onion');
    expect(results).toContain('combo-tomato-onion');
  });

  it('filters by category', () => {
    const spices = searchProducts(starterCatalog, '', { category: 'spices' });
    expect(spices.length).toBeGreaterThan(0);
    expect(spices.every((p) => p.category === 'spices')).toBe(true);
  });

  it('searches category labels', () => {
    const results = searchProducts(starterCatalog, 'dairy', { categoryLabels: { dairy: 'Dairy' } });
    expect(results.every((p) => p.category === 'dairy')).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns nothing for unrelated words', () => {
    expect(searchProducts(starterCatalog, 'laptop')).toEqual([]);
  });
});
