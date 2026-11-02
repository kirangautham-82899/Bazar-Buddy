import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { loadAppShell, loadAuthPage, prefetchWhenIdle } from '../../routes/lazy';
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

// Page shell: section order, scroll progress bar, and background work after first paint.
const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  // Prefetch the app, and send vendors who are already signed in to their dashboard.
  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;
    const cancelPrefetch = prefetchWhenIdle(loadAppShell, loadAuthPage);
    const idle = (fn) => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1200));
    idle(() => {
      onSignedIn(() => navigate('/dashboard', { replace: true }))
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
      <motion.div className="scroll-progress" style={{ scaleX: bar }} aria-hidden="true" />
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
