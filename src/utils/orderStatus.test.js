import { canCancel, estimatedDelivery, getOrderStage, recentPurchases, toDate } from './orderStatus';

const at = (iso) => new Date(iso);
const minutesAfter = (date, m) => new Date(date.getTime() + m * 60000);

describe('estimatedDelivery', () => {
  const placed = at('2026-11-02T10:00:00');

  it('express arrives in 45 minutes', () => {
    expect(estimatedDelivery(placed, 'express')).toEqual(minutesAfter(placed, 45));
  });

  it('scheduled arrives tomorrow at 7 AM', () => {
    expect(estimatedDelivery(placed, 'scheduled')).toEqual(at('2026-11-03T07:00:00'));
  });

  it('saver arrives within 24 hours', () => {
    expect(estimatedDelivery(placed, 'saver')).toEqual(minutesAfter(placed, 24 * 60));
  });
});

describe('getOrderStage', () => {
  const createdAt = at('2026-11-02T10:00:00');
  const order = { createdAt, speed: 'express', status: 'placed' };

  it('moves through every stage over time', () => {
    expect(getOrderStage(order, minutesAfter(createdAt, 1))).toBe('placed');
    expect(getOrderStage(order, minutesAfter(createdAt, 10))).toBe('confirmed');
    expect(getOrderStage(order, minutesAfter(createdAt, 30))).toBe('outForDelivery');
    expect(getOrderStage(order, minutesAfter(createdAt, 46))).toBe('delivered');
  });

  it('keeps cancelled orders cancelled', () => {
    expect(getOrderStage({ ...order, status: 'cancelled' }, minutesAfter(createdAt, 46))).toBe('cancelled');
  });

  it('treats a pending server timestamp as just placed', () => {
    expect(getOrderStage({ ...order, createdAt: null })).toBe('placed');
  });

  it('allows cancelling only before dispatch', () => {
    expect(canCancel('placed')).toBe(true);
    expect(canCancel('confirmed')).toBe(true);
    expect(canCancel('outForDelivery')).toBe(false);
    expect(canCancel('cancelled')).toBe(false);
  });
});

describe('toDate', () => {
  it('reads Firestore timestamps', () => {
    expect(toDate({ toDate: () => at('2026-01-01T00:00:00') })).toEqual(at('2026-01-01T00:00:00'));
    expect(toDate({ seconds: 0 })).toEqual(new Date(0));
    expect(toDate(null)).toBeNull();
  });
});

describe('recentPurchases', () => {
  const orders = [
    { status: 'placed', items: [{ id: 'tomato', quantity: 5 }, { id: 'retired-item', quantity: 1 }] },
    { status: 'cancelled', items: [{ id: 'garlic', quantity: 2 }] },
    { status: 'placed', items: [{ id: 'tomato', quantity: 1 }, { id: 'onion', quantity: 3 }] },
  ];

  it('lists newest purchases first, skips cancelled and unknown items', () => {
    const result = recentPurchases(orders).map((r) => [r.product.id, r.quantity]);
    expect(result).toEqual([
      ['tomato', 5],
      ['onion', 3],
    ]);
  });
});
