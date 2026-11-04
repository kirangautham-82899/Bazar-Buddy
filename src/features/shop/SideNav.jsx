import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBoxOpen, FaHeadset, FaHome, FaMapMarkedAlt, FaShoppingBasket, FaUser, FaUserShield } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CATEGORIES from '../../data/categories';
import { SUPPORT_PHONE } from '../../config/app';
import BrandMark from '../../components/common/BrandMark';
import ProductIcon from '../../components/common/ProductIcon';
import DeliveryChip from './DeliveryChip';
import { openAssistant } from '../assistant/openAssistant';

const MAIN_LINKS = [
  { to: '/shop', end: true, icon: FaHome, label: 'navHome' },
  { to: '/markets', icon: FaMapMarkedAlt, label: 'navMarkets' },
  { to: '/orders', icon: FaBoxOpen, label: 'navOrders' },
  { to: '/cart', icon: FaShoppingBasket, label: 'cart', badge: 'cart' },
  { to: '/account', icon: FaUser, label: 'navAccount' },
];

// Brand, delivery address, main sections, the AI assistant and every category, shown
// inside the slide-out drawer on phones.
const SideNav = ({ onNavigate, idPrefix = 'side' }) => {
  const { isAdmin } = useAuth();
  const { count } = useCart();
  const { pathname } = useLocation();

  const item = (to, Icon, label, { end, badge } = {}) => (
    <NavLink key={to} to={to} end={end} className="side-link" onClick={onNavigate}>
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId={`${idPrefix}-active`} className="side-link-active" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <Icon aria-hidden="true" className="side-link-icon" />
          <span className="side-link-label">{label}</span>
          {badge === 'cart' && count > 0 && <span className="side-badge">{count}</span>}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="side-nav">
      <Link to="/shop" className="side-brand" onClick={onNavigate} aria-label={t('appName')}>
        <BrandMark />
      </Link>

      <DeliveryChip onNavigate={onNavigate} />

      <nav className="side-section" aria-label={t('mainNav')}>
        {MAIN_LINKS.map(({ to, icon, label, end, badge }) => item(to, icon, t(label), { end, badge }))}
        {isAdmin && item('/admin', FaUserShield, t('adminPanel'))}
      </nav>

      <button
        type="button"
        className="side-ai"
        onClick={() => {
          onNavigate?.();
          openAssistant();
        }}
      >
        <span className="side-ai-icon" aria-hidden="true"><HiSparkles /></span>
        <span className="side-ai-text">
          <strong>{t('assistantAsk')}</strong>
          <small>{t('assistantTagline')}</small>
        </span>
      </button>

      <nav className="side-section" aria-labelledby={`${idPrefix}-categories`}>
        <p id={`${idPrefix}-categories`} className="side-heading">{t('categoriesLabel')}</p>
        {CATEGORIES.map((c) => (
          <NavLink
            key={c.id}
            to={`/shop/category/${c.id}`}
            className={`side-link side-category ${pathname === `/shop/category/${c.id}` ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <ProductIcon icon={c.icon} category={c.id} size="xs" />
            <span className="side-link-label">{t(c.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      <a href={`tel:${SUPPORT_PHONE}`} className="side-support">
        <FaHeadset aria-hidden="true" />
        <span>
          <strong>{t('callSupport')}</strong>
          <small>{t('supportHours')}</small>
        </span>
      </a>
    </div>
  );
};

export default SideNav;
