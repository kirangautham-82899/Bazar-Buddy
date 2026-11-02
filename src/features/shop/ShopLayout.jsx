import React, { Suspense, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '../../components/motion';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { prefetchWhenIdle, loadCartPage, loadCategoryPage, loadSearchPage } from '../../routes/lazy';
import ShopHeader from './ShopHeader';
import DesktopHeader from './DesktopHeader';
import BottomNav from './BottomNav';
import CartBar from './CartBar';
import './shop.css';

// Phones: compact header, floating cart bar and bottom tab bar.
// Desktop: one wide top bar with search, links and the cart; no bottom bar.
const ShopLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Fetch the screens a shopper is most likely to open next.
  useEffect(() => prefetchWhenIdle(loadSearchPage, loadCategoryPage, loadCartPage), []);

  return (
    <div className={`shop ${isDesktop ? 'shop-desktop' : 'shop-mobile'}`}>
      {isDesktop ? <DesktopHeader /> : <ShopHeader />}
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
      {!isDesktop && (
        <>
          <CartBar />
          <BottomNav />
        </>
      )}
    </div>
  );
};

export default ShopLayout;
