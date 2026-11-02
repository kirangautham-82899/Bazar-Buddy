// Business constants in one place so pricing rules are easy to audit.
export const SUPPORT_PHONE = process.env.REACT_APP_SUPPORT_PHONE || '+911234567890';
export const TOLL_FREE = process.env.REACT_APP_TOLL_FREE || '1800-123-4567';
export const UPI_ID = process.env.REACT_APP_UPI_ID || 'bazarbuddy@upi';

export const RUPEES_PER_COIN = 20;
export const MAX_COINS_PER_ORDER = 200; // must match firestore.rules
export const COINS_FOR_FREE_DELIVERY = 50;
export const MAX_ITEM_QUANTITY = 99;

export const DELIVERY_OPTIONS = {
  express: { fee: 30 },
  scheduled: { fee: 10 },
  saver: { fee: 0 },
};
export const VERIFIED_DELIVERY_FEE = 5;

export const DEFAULT_MAP_CENTER = [28.6139, 77.209];
