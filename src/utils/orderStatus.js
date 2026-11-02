// Order progress is derived from when the order was placed and the delivery
// speed chosen. When a supplier/delivery integration exists, replace
// `getOrderStage` with the status it reports.
import { findProduct } from '../data/products';

export const STAGES = ['placed', 'confirmed', 'outForDelivery', 'delivered'];

export const STAGE_LABEL_KEYS = {
  placed: 'statusPlaced',
  confirmed: 'statusConfirmed',
  outForDelivery: 'statusOutForDelivery',
  delivered: 'statusDelivered',
  cancelled: 'statusCancelled',
};

const MINUTE = 60 * 1000;

export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  return new Date(value);
};

export const estimatedDelivery = (createdAt, speed) => {
  const start = toDate(createdAt) || new Date();
  if (speed === 'express') return new Date(start.getTime() + 45 * MINUTE);
  if (speed === 'scheduled') {
    const eta = new Date(start);
    eta.setDate(eta.getDate() + 1);
    eta.setHours(7, 0, 0, 0);
    return eta;
  }
  return new Date(start.getTime() + 24 * 60 * MINUTE);
};

export const getOrderStage = (order, now = new Date()) => {
  if (order.status === 'cancelled') return 'cancelled';
  // Orders written moments ago have no server timestamp yet.
  const created = toDate(order.createdAt) || now;
  const eta = estimatedDelivery(created, order.speed);
  const total = eta - created;
  const confirmedAt = created.getTime() + Math.min(5 * MINUTE, total * 0.1);
  const outAt = eta.getTime() - Math.min(60 * MINUTE, total * 0.5);
  const t = now.getTime();

  if (t >= eta.getTime()) return 'delivered';
  if (t >= outAt) return 'outForDelivery';
  if (t >= confirmedAt) return 'confirmed';
  return 'placed';
};

export const isActiveStage = (stage) => stage !== 'delivered' && stage !== 'cancelled';

export const canCancel = (stage) => stage === 'placed' || stage === 'confirmed';

// Most recently bought products (newest order first, no duplicates) with the
// quantity last ordered. `orders` must already be sorted newest first.
export const recentPurchases = (orders, maxItems = 4) => {
  const seen = new Map();
  for (const order of orders) {
    if (order.status === 'cancelled') continue;
    for (const item of order.items) {
      if (!seen.has(item.id) && findProduct(item.id)) seen.set(item.id, item.quantity);
    }
  }
  return [...seen.entries()]
    .slice(0, maxItems)
    .map(([id, quantity]) => ({ product: findProduct(id), quantity }));
};
