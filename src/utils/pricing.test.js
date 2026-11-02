import { FREE_DELIVERY_ABOVE } from '../config/app';
import { computeTotals, discountPct } from './pricing';

describe('computeTotals', () => {
  const items = [
    { price: 30, quantity: 2 },
    { price: 248, mrp: 275, quantity: 1 },
  ];

  it('adds the delivery fee below the free-delivery threshold', () => {
    const totals = computeTotals(items, { speed: 'express' });
    expect(totals.itemTotal).toBe(308);
    expect(totals.deliveryFee).toBe(30);
    expect(totals.total).toBe(338);
    expect(totals.savings).toBe(27);
    expect(totals.amountToFreeDelivery).toBe(FREE_DELIVERY_ABOVE - 308);
  });

  it('waives delivery once the item total reaches the threshold', () => {
    const totals = computeTotals([{ price: FREE_DELIVERY_ABOVE, quantity: 1 }], { speed: 'express' });
    expect(totals.freeDelivery).toBe(true);
    expect(totals.deliveryFee).toBe(0);
    expect(totals.total).toBe(FREE_DELIVERY_ABOVE);
  });

  it('saver delivery is always free', () => {
    expect(computeTotals(items, { speed: 'saver' }).deliveryFee).toBe(0);
  });

  it('is zero for an empty cart', () => {
    expect(computeTotals([], { speed: 'express' }).total).toBe(0);
  });
});

describe('discountPct', () => {
  it('rounds the saving against MRP', () => {
    expect(discountPct({ price: 248, mrp: 275 })).toBe(10);
    expect(discountPct({ price: 30, mrp: null })).toBe(0);
  });
});
