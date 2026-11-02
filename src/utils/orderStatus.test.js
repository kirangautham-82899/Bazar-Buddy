import { NEXT_STATUS, STAGES, canAdminCancel, canCustomerCancel, estimatedDelivery, isActiveStatus, toDate } from './orderStatus';

const at = (iso) => new Date(iso);
const minutesAfter = (date, m) => new Date(date.getTime() + m * 60000);

describe('order lifecycle', () => {
  it('walks every stage in order and stops at delivered', () => {
    let status = 'placed';
    const seen = [status];
    while (NEXT_STATUS[status]) {
      status = NEXT_STATUS[status].status;
      seen.push(status);
    }
    expect(seen).toEqual(STAGES);
  });

  it('lets customers cancel only before packing', () => {
    expect(canCustomerCancel('placed')).toBe(true);
    expect(canCustomerCancel('confirmed')).toBe(true);
    expect(canCustomerCancel('packed')).toBe(false);
    expect(canCustomerCancel('delivered')).toBe(false);
  });

  it('lets the team cancel anything still open', () => {
    expect(canAdminCancel('outForDelivery')).toBe(true);
    expect(canAdminCancel('delivered')).toBe(false);
    expect(canAdminCancel('cancelled')).toBe(false);
    expect(isActiveStatus('packed')).toBe(true);
  });
});

describe('estimatedDelivery', () => {
  const placed = at('2026-11-02T10:00:00');

  it('express arrives in 45 minutes', () => {
    expect(estimatedDelivery(placed, 'express')).toEqual(minutesAfter(placed, 45));
  });

  it('early-morning arrives tomorrow at 7 AM', () => {
    expect(estimatedDelivery(placed, 'scheduled')).toEqual(at('2026-11-03T07:00:00'));
  });

  it('saver arrives within 24 hours', () => {
    expect(estimatedDelivery(placed, 'saver')).toEqual(minutesAfter(placed, 24 * 60));
  });
});

describe('toDate', () => {
  it('reads Firestore timestamps', () => {
    expect(toDate({ toDate: () => at('2026-01-01T00:00:00') })).toEqual(at('2026-01-01T00:00:00'));
    expect(toDate({ seconds: 0 })).toEqual(new Date(0));
    expect(toDate(null)).toBeNull();
  });
});
