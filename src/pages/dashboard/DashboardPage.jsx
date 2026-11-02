import React, { Suspense, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShopProvider } from '../../context/ShopContext';
import TopNavbar from '../../components/layout/TopNavbar';
import BottomNav from '../../components/layout/BottomNav';
import { Skeleton } from '../../components/motion';
import {
  loadHelp,
  loadHome,
  loadMarket,
  loadProfile,
  loadTrade,
  loadWallet,
  prefetchWhenIdle,
} from '../../routes/lazy';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useLanguage } from '../../context/LanguageContext';
import './DashboardPage.css';

// Each tab slides and fades in; the outlet is frozen so the old tab can animate out.
const AnimatedOutlet = () => {
  const location = useLocation();
  const outlet = useOutlet();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<div className="page"><Skeleton lines={5} /></div>}>{outlet}</Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const DashboardPage = () => {
  const { t } = useLanguage();
  useDocumentMeta({ title: t('appName'), noindex: true });
  // Once the first tab is up, quietly fetch the others so switching tabs is instant.
  useEffect(() => prefetchWhenIdle(loadHome, loadMarket, loadWallet, loadProfile, loadHelp, loadTrade), []);

  return (
    <ShopProvider>
      <div className="dashboard">
        <div className="dashboard-glow" aria-hidden="true" />
        <TopNavbar />
        <main className="dashboard-main" id="main-content">
          <AnimatedOutlet />
        </main>
        <BottomNav />
      </div>
    </ShopProvider>
  );
};

export default DashboardPage;
