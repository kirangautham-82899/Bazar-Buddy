import { findProduct } from '../data/products';

// Turns stored cart lines ({ id, quantity }) into full items with current prices.
// Lines for products no longer in the catalog are dropped.
export const resolveCartItems = (lines) =>
  lines
    .map((line) => {
      const product = findProduct(line.id);
      return product && line.quantity > 0 ? { ...product, quantity: line.quantity } : null;
    })
    .filter(Boolean);
