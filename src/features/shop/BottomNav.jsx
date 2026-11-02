import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBoxOpen, FaHome, FaThLarge, FaUser } from 'react-icons/fa';
import { t } from '../../content/strings';
import CATEGORIES from '../../data/categories';

const TABS = [
  { to: '/shop', end: true, icon: FaHome, label: 'navHome', match: (p) => p === '/shop' || p === '/shop/search' },
  { to: `/shop/category/${CATEGORIES[0].id}`, icon: FaThLarge, label: 'navCategories', match: (p) => p.startsWith('/shop/category') },
  { to: '/orders', icon: FaBoxOpen, label: 'navOrders', match: (p) => p.startsWith('/orders') },
  { to: '/account', icon: FaUser, label: 'navAccount', match: (p) => p.startsWith('/account') },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav" aria-label={t('mainNav')}>
      <div className="bottom-nav-inner">
        {TABS.map(({ to, icon: Icon, label, match }) => {
          const active = match(pathname);
          return (
            <NavLink key={label} to={to} className={`nav-item ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
              {active && <motion.span layoutId="bottom-nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 450, damping: 32 }} />}
              <motion.span className="nav-icon" animate={{ y: active ? -1 : 0, scale: active ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                <Icon aria-hidden="true" />
              </motion.span>
              <span className="nav-label">{t(label)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
