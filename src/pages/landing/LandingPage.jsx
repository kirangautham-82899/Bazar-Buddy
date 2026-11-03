import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadAppShell, loadAuthPage, loadShopHome, loadShopLayout, prefetchWhenIdle } from '../../routes/lazy';
import { onSignedIn } from '../../routes/sessionCheck';
import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Features from './sections/Features';
import Categories from './sections/Categories';
import HowItWorks from './sections/HowItWorks';
import Faq from './sections/Faq';
import FinalCta from './sections/FinalCta';
import Footer from './sections/Footer';
import './LandingPage.css';

// Page shell: section order, and background work after first paint.
const LandingPage = () => {
  const navigate = useNavigate();

  // Prefetch the shop, and send vendors who are already signed in straight to it.
  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;
    const cancelPrefetch = prefetchWhenIdle(loadAppShell, loadShopLayout, loadShopHome, loadAuthPage);
    const idle = (fn) => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1200));
    idle(() => {
      onSignedIn(() => navigate('/shop', { replace: true }))
        .then((stop) => (active ? (unsubscribe = stop) : stop()))
        .catch(() => {});
    });
    return () => {
      active = false;
      cancelPrefetch();
      unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="landing">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Categories />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
