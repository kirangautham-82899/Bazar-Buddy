import { catalog } from '../data/products';
import { levenshtein, normalize, searchProducts } from './search';

const ids = (list) => list.map((p) => p.id);

describe('normalize', () => {
  it('lowercases, strips punctuation and the Hindi nukta', () => {
    expect(normalize('  Tomatoes!! ')).toBe('tomatoes');
    expect(normalize('प्याज़')).toBe(normalize('प्याज'));
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
    expect(searchProducts(catalog, '   ')).toHaveLength(catalog.length);
  });

  it('matches English, Hindi and Hinglish names', () => {
    expect(ids(searchProducts(catalog, 'tomato'))[0]).toBe('tomato');
    expect(ids(searchProducts(catalog, 'टमाटर'))[0]).toBe('tomato');
    expect(ids(searchProducts(catalog, 'pyaz'))[0]).toBe('onion');
    expect(ids(searchProducts(catalog, 'aloo'))[0]).toBe('potato');
  });

  it('matches Hindi with or without the nukta', () => {
    expect(ids(searchProducts(catalog, 'प्याज'))).toContain('onion');
    expect(ids(searchProducts(catalog, 'प्याज़'))).toContain('onion');
  });

  it('tolerates small typos', () => {
    expect(ids(searchProducts(catalog, 'tomatos'))).toContain('tomato');
    expect(ids(searchProducts(catalog, 'potatoe'))).toContain('potato');
  });

  it('matches by prefix while typing', () => {
    expect(ids(searchProducts(catalog, 'gar'))).toContain('garlic');
  });

  it('requires every word to match', () => {
    expect(ids(searchProducts(catalog, 'mustard oil'))).toEqual(['mustard-oil']);
  });

  it('ranks exact matches above combos that mention the item', () => {
    const results = ids(searchProducts(catalog, 'onion'));
    expect(results[0]).toBe('onion');
    expect(results).toContain('combo-tomato-onion');
  });

  it('filters by category', () => {
    const spices = searchProducts(catalog, '', { category: 'spices' });
    expect(spices.length).toBeGreaterThan(0);
    expect(spices.every((p) => p.category === 'spices')).toBe(true);
  });

  it('searches translated category labels', () => {
    const results = searchProducts(catalog, 'मसाले', { categoryLabels: { spices: 'मसाले' } });
    expect(results.every((p) => p.category === 'spices')).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns nothing for unrelated words', () => {
    expect(searchProducts(catalog, 'laptop')).toEqual([]);
  });
});
