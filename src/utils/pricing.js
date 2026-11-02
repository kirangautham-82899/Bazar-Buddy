import { DELIVERY_OPTIONS, FREE_DELIVERY_ABOVE } from '../config/app';

export const lineTotal = (item) => item.price * item.quantity;

// Single source of truth for cart and order amounts. `items` carry current prices.
export const computeTotals = (items, { speed = 'saver' } = {}) => {
  const itemTotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const savings = items.reduce((sum, item) => sum + (item.mrp > item.price ? (item.mrp - item.price) * item.quantity : 0), 0);
  const baseFee = DELIVERY_OPTIONS[speed]?.fee ?? 0;
  const freeDelivery = itemTotal >= FREE_DELIVERY_ABOVE;
  const deliveryFee = items.length && !freeDelivery ? baseFee : 0;
  return {
    itemTotal,
    savings,
    deliveryFee,
    freeDelivery,
    amountToFreeDelivery: Math.max(0, FREE_DELIVERY_ABOVE - itemTotal),
    total: items.length ? itemTotal + deliveryFee : 0,
  };
};

export const discountPct = (product) =>
  product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
