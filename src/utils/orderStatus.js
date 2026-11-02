// Order lifecycle. Status is set by the team in the admin panel; customers can
// only cancel before the order is packed.
import { EXPRESS_MINUTES } from '../config/app';

export const STAGES = ['placed', 'confirmed', 'packed', 'outForDelivery', 'delivered'];

export const STATUS_LABEL_KEYS = {
  placed: 'statusPlaced',
  confirmed: 'statusConfirmed',
  packed: 'statusPacked',
  outForDelivery: 'statusOutForDelivery',
  delivered: 'statusDelivered',
  cancelled: 'statusCancelled',
};

// The next step staff can move an order to, and the button that does it.
export const NEXT_STATUS = {
  placed: { status: 'confirmed', labelKey: 'confirmOrder' },
  confirmed: { status: 'packed', labelKey: 'markPacked' },
  packed: { status: 'outForDelivery', labelKey: 'markOutForDelivery' },
  outForDelivery: { status: 'delivered', labelKey: 'markDelivered' },
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
  if (speed === 'express') return new Date(start.getTime() + EXPRESS_MINUTES * MINUTE);
  if (speed === 'scheduled') {
    const eta = new Date(start);
    eta.setDate(eta.getDate() + 1);
    eta.setHours(7, 0, 0, 0);
    return eta;
  }
  return new Date(start.getTime() + 24 * 60 * MINUTE);
};

export const isActiveStatus = (status) => status !== 'delivered' && status !== 'cancelled';

export const canCustomerCancel = (status) => status === 'placed' || status === 'confirmed';

export const canAdminCancel = (status) => isActiveStatus(status);
