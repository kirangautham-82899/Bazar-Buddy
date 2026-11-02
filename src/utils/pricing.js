import {
  DELIVERY_OPTIONS,
  MAX_COINS_PER_ORDER,
  RUPEES_PER_COIN,
  VERIFIED_DELIVERY_FEE,
} from '../config/app';

const OVERPRICE_THRESHOLD_PCT = 15;

export const median = (values) => {
  const sorted = values.filter((v) => typeof v === 'number').sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Fair price = median of what nearby groups charge plus our own catalog price.
// The median ignores one-off outliers, which is what a vendor cares about.
export const fairPriceFor = (productId, groups, catalogPrice) => {
  const groupPrices = groups.map((g) => g.prices?.[productId]);
  const fair = median([...groupPrices, catalogPrice]);
  return fair === null ? null : Math.round(fair);
};

export const deviationPct = (price, fair) =>
  fair ? Math.round(((price - fair) / fair) * 100) : 0;

export const isOverpriced = (price, fair) => deviationPct(price, fair) > OVERPRICE_THRESHOLD_PCT;

export const lineTotal = (item) => item.price * item.quantity;

// Single source of truth for cart and order amounts.
export const computeTotals = (items, { speed = 'saver', verified = false, freeDeliveryCredits = 0 } = {}) => {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const comboSavings = items.reduce(
    (sum, item) => sum + (item.mrp ? (item.mrp - item.price) * item.quantity : 0),
    0
  );
  const baseFee = DELIVERY_OPTIONS[speed]?.fee ?? 0;
  const usesCredit = baseFee > 0 && freeDeliveryCredits > 0;
  const deliveryFee = usesCredit ? 0 : baseFee;
  const verifiedFee = verified ? VERIFIED_DELIVERY_FEE : 0;
  const total = items.length ? subtotal + deliveryFee + verifiedFee : 0;

  return {
    subtotal,
    comboSavings,
    deliveryFee,
    verifiedFee,
    usesCredit,
    creditSaving: usesCredit ? baseFee : 0,
    total,
    coinsEarned: Math.min(Math.floor(total / RUPEES_PER_COIN), MAX_COINS_PER_ORDER),
  };
};
