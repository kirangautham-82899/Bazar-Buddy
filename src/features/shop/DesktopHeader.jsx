import React from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaShoppingBasket, FaUserCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CATEGORIES from '../../data/categories';
import { formatRupees } from '../../utils/format';
import BrandMark from '../../components/common/BrandMark';
import ProductIcon from '../../components/common/ProductIcon';
import DeliveryChip from './DeliveryChip';
import SearchBox from './SearchBox';
import { openAssistant } from '../assistant/openAssistant';

const MAIN_LINKS = [
  { to: '/shop', end: true, label: 'navHome' },
  { to: '/markets', label: 'navMarkets' },
  { to: '/orders', label: 'navOrders' },
];

// Desktop header. Top row: brand, delivery address, search, assistant, account and cart.
// Bottom row: the main sections and every category, so pages get the full width.
const DesktopHeader = () => {
  const { user, profile, isAdmin } = useAuth();
  const { count, totals } = useCart();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const onSearchPage = pathname === '/shop/search';

  // Typing anywhere jumps to the search page; the query lives in the URL.
  const handleQuery = (q) => navigate(q ? `/shop/search?q=${encodeURIComponent(q)}` : '/shop/search', { replace: onSearchPage });

  const links = isAdmin ? [...MAIN_LINKS, { to: '/admin', label: 'adminPanel' }] : MAIN_LINKS;

  return (
    <header className="dh">
      <div className="dh-top">
        <div className="dh-inner">
          <Link to="/shop" className="dh-brand" aria-label={t('appName')}>
            <BrandMark />
          </Link>
          <DeliveryChip className="dh-delivery" />
          <div className="dh-search">
            <SearchBox query={onSearchPage ? params.get('q') || '' : ''} onQueryChange={handleQuery} autoFocus={onSearchPage} />
          </div>
          <button type="button" className="dh-ai" onClick={openAssistant}>
            <HiSparkles aria-hidden="true" />
            <span>{t('assistantAsk')}</span>
          </button>
          {user ? (
            <Link to="/account" className="dh-account">
              <FaUserCircle aria-hidden="true" />
              <span>{profile?.name?.split(' ')[0] || t('navAccount')}</span>
            </Link>
          ) : (
            <Link to={`/auth?next=${encodeURIComponent(pathname)}`} className="dh-account">
              <FaUserCircle aria-hidden="true" />
              <span>{t('navLogin')}</span>
            </Link>
          )}
          <Link to="/cart" className={`dh-cart ${count ? 'has-items' : ''}`} aria-label={`${t('cart')}: ${count === 1 ? t('cartItem') : t('cartItems', { n: count })}`}>
            <FaShoppingBasket aria-hidden="true" />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                className="dh-cart-text"
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {count ? (
                  <>
                    <strong>{count === 1 ? t('cartItem') : t('cartItems', { n: count })}</strong>
                    <span>{formatRupees(totals.itemTotal)}</span>
                  </>
                ) : (
                  <strong>{t('cart')}</strong>
                )}
              </motion.span>
            </AnimatePresence>
          </Link>
        </div>
      </div>

      <div className="dh-bottom">
        <div className="dh-inner">
          <nav className="dh-nav" aria-label={t('mainNav')}>
            {links.map(({ to, end, label }) => (
              <NavLink key={to} to={to} end={end} className="dh-link">
                {t(label)}
              </NavLink>
            ))}
          </nav>
          <span className="dh-divider" aria-hidden="true" />
          <nav className="dh-nav dh-categories" aria-label={t('categoriesLabel')}>
            {CATEGORIES.map((c) => (
              <NavLink key={c.id} to={`/shop/category/${c.id}`} className="dh-link dh-category">
                <ProductIcon icon={c.icon} category={c.id} size="xs" />
                {t(c.labelKey)}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
