import { applyQuantityChange, mergeCartLines } from './cartService';

describe('applyQuantityChange', () => {
  it('adds a new line and increments existing ones', () => {
    let items = applyQuantityChange([], 'tomato', 1, 10);
    items = applyQuantityChange(items, 'tomato', 2, 10);
    expect(items).toEqual([{ id: 'tomato', quantity: 3 }]);
  });

  it('never goes above the stock left', () => {
    expect(applyQuantityChange([{ id: 'onion', quantity: 4 }], 'onion', 5, 6)).toEqual([{ id: 'onion', quantity: 6 }]);
  });

  it('removes the line at zero', () => {
    expect(applyQuantityChange([{ id: 'onion', quantity: 1 }], 'onion', -1)).toEqual([]);
    expect(applyQuantityChange([{ id: 'onion', quantity: 7 }], 'onion', -Infinity)).toEqual([]);
  });

  it('cannot add a sold-out product', () => {
    expect(applyQuantityChange([], 'paneer', 1, 0)).toEqual([]);
  });
});

describe('mergeCartLines', () => {
  it('adds a guest cart onto the saved one on login', () => {
    const saved = [{ id: 'tomato', quantity: 2 }];
    const guest = [{ id: 'tomato', quantity: 1 }, { id: 'rice', quantity: 5 }];
    expect(mergeCartLines(saved, guest)).toEqual([
      { id: 'tomato', quantity: 3 },
      { id: 'rice', quantity: 5 },
    ]);
  });
});
