import React from 'react';
import { NavLink } from 'react-router-dom';
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
      {TABS.map(({ to, end, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Icon aria-hidden="true" />
          <span>{t(label)}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
