import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExchangeAlt, FaHome, FaStore, FaUser, FaWallet } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import './BottomNav.css';

const TABS = [
  { to: '/dashboard', end: true, icon: FaHome, label: 'navHome' },
  { to: '/dashboard/market', icon: FaStore, label: 'navMarket' },
  { to: '/dashboard/wallet', icon: FaWallet, label: 'navWallet' },
  { to: '/dashboard/trade', icon: FaExchangeAlt, label: 'navTrade' },
  { to: '/dashboard/profile', icon: FaUser, label: 'navProfile' },
];

const BottomNav = () => {
  const { t } = useLanguage();
  return (
    <nav className="bottom-nav" aria-label={t('mainNav')}>
      <div className="bottom-nav-inner">
        {TABS.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span layoutId="bottom-nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 450, damping: 32 }} />
                )}
                <motion.span className="nav-icon" animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                  <Icon aria-hidden="true" />
                </motion.span>
                <span className="nav-label">{t(label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
