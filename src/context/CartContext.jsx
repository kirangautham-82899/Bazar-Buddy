import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCatalog } from './CatalogContext';
import { useToast } from './ToastContext';
import { t } from '../content/strings';
import {
  DEFAULT_CART,
  applyQuantityChange,
  changeCartQuantity,
  clearGuestCart,
  mergeIntoCart,
  readGuestCart,
  subscribeCart,
  updateCartOptions,
  writeGuestCart,
} from '../services/cartService';
import { computeTotals } from '../utils/pricing';

const CartContext = createContext(null);

// One cart API for guests (saved on the device) and signed-in vendors (Firestore).
// When a guest logs in, their device cart is merged into their account cart.
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { findProduct } = useCatalog();
  const toast = useToast();
  const [cart, setCart] = useState(readGuestCart);
  const mergedFor = useRef(null);

  const reportError = useCallback(
    (err) => {
      console.error(err);
      toast.show(err?.code === 'unavailable' ? t('errNetwork') : t('errGeneric'), 'error');
    },
    [toast]
  );

  useEffect(() => {
    if (!user) {
      mergedFor.current = null;
      setCart(readGuestCart());
      return undefined;
    }
    const guest = readGuestCart();
    if (guest.items.length && mergedFor.current !== user.uid) {
      mergedFor.current = user.uid;
      mergeIntoCart(user.uid, guest.items).then(clearGuestCart).catch(reportError);
    }
    return subscribeCart(user.uid, setCart, reportError);
  }, [user, reportError]);

  // Lines joined with live catalog data; `available` is false for hidden or sold-out items.
  const items = useMemo(
    () =>
      (cart.items || []).map((line) => {
        const product = findProduct(line.id);
        const available = Boolean(product && product.stock > 0);
        return { ...(product || { id: line.id, name: t('unavailable'), price: 0 }), quantity: line.quantity, available };
      }),
    [cart.items, findProduct]
  );

  const billable = useMemo(() => items.filter((i) => i.available), [items]);
  const totals = useMemo(() => computeTotals(billable, { speed: cart.speed }), [billable, cart.speed]);
  const count = useMemo(() => billable.reduce((n, i) => n + i.quantity, 0), [billable]);

  const changeQuantity = useCallback(
    (productId, delta) => {
      const maxQuantity = findProduct(productId)?.stock ?? 0;
      if (user) return changeCartQuantity(user.uid, productId, delta, maxQuantity).catch(reportError);
      setCart((current) => {
        const next = { ...current, items: applyQuantityChange(current.items, productId, delta, maxQuantity) };
        writeGuestCart(next);
        return next;
      });
      return Promise.resolve();
    },
    [user, findProduct, reportError]
  );

  const setOptions = useCallback(
    (options) => {
      if (user) return updateCartOptions(user.uid, options).catch(reportError);
      setCart((current) => {
        const next = { ...current, ...options };
        writeGuestCart(next);
        return next;
      });
      return Promise.resolve();
    },
    [user, reportError]
  );

  const value = useMemo(
    () => ({
      cart: { ...DEFAULT_CART, ...cart },
      items,
      count,
      totals,
      quantityOf: (id) => (cart.items || []).find((l) => l.id === id)?.quantity || 0,
      changeQuantity,
      removeItem: (id) => changeQuantity(id, -Infinity),
      setOptions,
      reportError,
    }),
    [cart, items, count, totals, changeQuantity, setOptions, reportError]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
