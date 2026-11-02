// One loader per code-split screen, shared by React.lazy() and idle prefetching
// so a prefetched chunk is reused (the browser caches the import).
export const loadAppShell = () => import('./AppShell');
export const loadAuthPage = () => import('../pages/auth/AuthPage');
export const loadShopLayout = () => import('../features/shop/ShopLayout');
export const loadShopHome = () => import('../features/shop/ShopHome');
export const loadCategoryPage = () => import('../features/shop/CategoryPage');
export const loadSearchPage = () => import('../features/shop/SearchPage');
export const loadCartPage = () => import('../features/cart/CartPage');
export const loadOrdersPage = () => import('../features/orders/OrdersPage');
export const loadAccountPage = () => import('../features/account/AccountPage');
export const loadMarketsPage = () => import('../features/markets/MarketsPage');
export const loadAdmin = () => import('../features/admin/AdminLayout');

const saveData = () =>
  typeof navigator !== 'undefined' && (navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType || ''));

// Downloads the given screens once the browser is idle, so the next tap is instant.
// Skipped on Data Saver / 2G connections, where vendors pay for every byte.
export const prefetchWhenIdle = (...loaders) => {
  if (typeof window === 'undefined' || saveData()) return () => {};
  const run = () => loaders.forEach((load) => load().catch(() => {}));
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(run, 2000);
  return () => clearTimeout(id);
};
