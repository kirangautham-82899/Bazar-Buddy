// One loader per code-split screen, shared by React.lazy() and idle prefetching
// so a prefetched chunk is reused (the browser caches the import).
export const loadAppShell = () => import('./AppShell');
export const loadAuthPage = () => import('../pages/auth/AuthPage');
export const loadDashboardPage = () => import('../pages/dashboard/DashboardPage');
export const loadHome = () => import('../features/home/HomeSection');
export const loadMarket = () => import('../features/market/MarketSection');
export const loadWallet = () => import('../features/wallet/WalletSection');
export const loadTrade = () => import('../features/trade/TradeSection');
export const loadProfile = () => import('../features/profile/ProfileSection');
export const loadHelp = () => import('../features/help/HelpSection');

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
