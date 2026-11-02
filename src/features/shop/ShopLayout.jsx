import React, { Suspense, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '../../components/motion';
import { prefetchWhenIdle, loadCartPage, loadCategoryPage, loadSearchPage } from '../../routes/lazy';
import ShopHeader from './ShopHeader';
import BottomNav from './BottomNav';
import CartBar from './CartBar';
import './shop.css';

// Header, page transitions, floating cart bar and bottom nav around every shop screen.
const ShopLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Fetch the screens a shopper is most likely to open next.
  useEffect(() => prefetchWhenIdle(loadSearchPage, loadCategoryPage, loadCartPage), []);

  return (
    <div className="shop">
      <ShopHeader />
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
      <CartBar />
      <BottomNav />
    </div>
  );
};

export default ShopLayout;
