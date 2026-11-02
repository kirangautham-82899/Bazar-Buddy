// Business settings in one place so pricing rules are easy to audit and change.
export const SUPPORT_PHONE = import.meta.env.REACT_APP_SUPPORT_PHONE || '+911234567890';
export const TOLL_FREE = import.meta.env.REACT_APP_TOLL_FREE || '1800-123-4567';
export const UPI_ID = import.meta.env.REACT_APP_UPI_ID || 'bazarbuddy@upi';

export const MAX_ITEM_QUANTITY = 99;

// Delivery is free when the item total reaches this amount (₹).
export const FREE_DELIVERY_ABOVE = 500;
export const EXPRESS_MINUTES = 45;

export const DELIVERY_OPTIONS = {
  express: { fee: 30 },
  scheduled: { fee: 10 },
  saver: { fee: 0 },
};
export const DELIVERY_SPEEDS = Object.keys(DELIVERY_OPTIONS);
export const PAYMENT_METHODS = ['upi', 'cod'];

// Public URL used for canonical links, the sitemap and structured data.
export const SITE_URL = (import.meta.env.REACT_APP_SITE_URL || 'https://bazar-buddy-neon.vercel.app').replace(/\/$/, '');
