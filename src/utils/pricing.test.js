import { computeTotals, deviationPct, fairPriceFor, isOverpriced, median } from './pricing';

describe('median', () => {
  it('handles odd, even and empty lists', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([undefined, null])).toBeNull();
  });
});

describe('fair price', () => {
  const groups = [{ prices: { tomato: 30 } }, { prices: { tomato: 32 } }, { prices: { tomato: 90 } }, { prices: {} }];

  it('uses the median so one expensive group does not skew it', () => {
    expect(fairPriceFor('tomato', groups, 31)).toBe(32);
  });

  it('flags prices more than 15% above fair', () => {
    expect(deviationPct(45, 30)).toBe(50);
    expect(isOverpriced(45, 30)).toBe(true);
    expect(isOverpriced(34, 30)).toBe(false);
  });
});

describe('computeTotals', () => {
  const items = [
    { price: 30, quantity: 2 },
    { price: 248, mrp: 275, quantity: 1 },
  ];

  it('adds delivery and verified fees', () => {
    const totals = computeTotals(items, { speed: 'express', verified: true });
    expect(totals.subtotal).toBe(308);
    expect(totals.deliveryFee).toBe(30);
    expect(totals.verifiedFee).toBe(5);
    expect(totals.total).toBe(343);
    expect(totals.comboSavings).toBe(27);
    expect(totals.coinsEarned).toBe(17);
  });

  it('uses a free-delivery credit only when there is a fee to waive', () => {
    const paid = computeTotals(items, { speed: 'scheduled', freeDeliveryCredits: 1 });
    expect(paid.usesCredit).toBe(true);
    expect(paid.deliveryFee).toBe(0);
    expect(paid.creditSaving).toBe(10);

    const saver = computeTotals(items, { speed: 'saver', freeDeliveryCredits: 1 });
    expect(saver.usesCredit).toBe(false);
  });

  it('caps coins per order', () => {
    expect(computeTotals([{ price: 10000, quantity: 1 }]).coinsEarned).toBe(200);
  });

  it('is zero for an empty cart even with fees selected', () => {
    expect(computeTotals([], { speed: 'express', verified: true }).total).toBe(0);
  });
});
