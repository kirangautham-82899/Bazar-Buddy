import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useToast } from './ToastContext';
import {
  DEFAULT_CART,
  changeQuantity,
  removeItem,
  subscribeCart,
  updateCartOptions,
} from '../services/cartService';
import { subscribeOrders } from '../services/orderService';
import { resolveCartItems } from '../data/products';

const ShopContext = createContext(null);

// Cart and orders are subscribed once for the whole dashboard, so every tab
// (and the cart badge) sees the same live data.
export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [cart, setCart] = useState(DEFAULT_CART);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const reportError = useCallback(
    (err) => {
      console.error(err);
      toast.show(err?.code === 'unavailable' ? t('errNetwork') : t('errGeneric'), 'error');
    },
    [t, toast]
  );

  useEffect(() => {
    if (!user) return undefined;
    return subscribeCart(user.uid, setCart, reportError);
  }, [user, reportError]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeOrders(
      user.uid,
      (list) => {
        setOrders(list);
        setOrdersLoading(false);
      },
      (err) => {
        setOrdersLoading(false);
        reportError(err);
      }
    );
  }, [user, reportError]);

  const cartItems = useMemo(() => resolveCartItems(cart.items || []), [cart.items]);
  const cartCount = useMemo(() => cartItems.reduce((n, i) => n + i.quantity, 0), [cartItems]);

  const value = useMemo(
    () => ({
      cart,
      cartItems,
      cartCount,
      orders,
      ordersLoading,
      quantityOf: (id) => cartItems.find((i) => i.id === id)?.quantity || 0,
      addToCart: (id, qty = 1) => changeQuantity(user.uid, id, qty).catch(reportError),
      changeQuantity: (id, delta) => changeQuantity(user.uid, id, delta).catch(reportError),
      removeFromCart: (id) => removeItem(user.uid, id).catch(reportError),
      setCartOptions: (options) => updateCartOptions(user.uid, options).catch(reportError),
      reportError,
    }),
    [cart, cartItems, cartCount, orders, ordersLoading, user, reportError]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside ShopProvider');
  return ctx;
};
