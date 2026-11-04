import React, { Suspense, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '../../components/motion';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { prefetchWhenIdle, loadCartPage, loadCategoryPage, loadMarketsPage, loadSearchPage } from '../../routes/lazy';
import ShopHeader from './ShopHeader';
import DesktopHeader from './DesktopHeader';
import DesktopFooter from './DesktopFooter';
import BottomNav from './BottomNav';
import CartBar from './CartBar';
import AssistantChat from '../assistant/AssistantChat';
import './shop.css';
import './layout.css';

// Desktop: two-row header (search and cart; sections and categories), full-width pages, footer.
// Phones: header with a menu button (side drawer), floating cart bar and bottom tab bar.
// Both: the floating chat assistant.
const ShopLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Fetch the screens a shopper is most likely to open next.
  useEffect(() => prefetchWhenIdle(loadSearchPage, loadCategoryPage, loadCartPage, loadMarketsPage), []);

  const page = (
    <main className="shop-main" id="main-content">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<div className="page"><Skeleton lines={5} /></div>}>{outlet}</Suspense>
        </motion.div>
      </AnimatePresence>
    </main>
  );

  if (isDesktop) {
    return (
      <div className="shop shop-desktop">
        <DesktopHeader />
        {page}
        <DesktopFooter />
        <AssistantChat />
      </div>
    );
  }

  return (
    <div className="shop shop-mobile">
      <ShopHeader />
      {page}
      <CartBar />
      <BottomNav />
      <AssistantChat />
    </div>
  );
};

export default ShopLayout;
