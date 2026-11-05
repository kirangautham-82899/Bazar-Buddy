import React, { Suspense, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
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
      {/* The new page shows at once with a CSS fade-in. (Waiting for the old page to
          animate out could leave a blank screen when the hand-off was missed.) */}
      <div key={location.pathname} className="fade-in">
        <Suspense fallback={<div className="page"><Skeleton lines={5} /></div>}>{outlet}</Suspense>
      </div>
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
