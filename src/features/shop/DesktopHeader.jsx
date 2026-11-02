import React from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBolt, FaChevronDown, FaMapMarkerAlt, FaShoppingBasket, FaUserCircle } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { EXPRESS_MINUTES } from '../../config/app';
import CATEGORIES from '../../data/categories';
import { formatRupees } from '../../utils/format';
import BrandMark from '../../components/common/BrandMark';
import SearchBox from './SearchBox';

// Desktop: one wide bar with address, a live search box, links and the cart,
// plus a row of category links underneath.
const DesktopHeader = () => {
  const { user, profile } = useAuth();
  const { count, totals } = useCart();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const onSearchPage = pathname === '/shop/search';
  const address = profile?.address;

  // Typing anywhere jumps to the search page; the query lives in the URL.
  const handleQuery = (q) => navigate(q ? `/shop/search?q=${encodeURIComponent(q)}` : '/shop/search', { replace: onSearchPage });

  return (
    <header className="desk-header">
      <div className="desk-header-row">
        <Link to="/shop" className="desk-brand" aria-label={t('appName')}>
          <BrandMark />
        </Link>
        <Link to={user ? '/account#address' : '/auth?next=/account'} className="shop-delivery desk-delivery">
          <span className="shop-eta">
            <FaBolt aria-hidden="true" /> {t('deliveryIn', { minutes: EXPRESS_MINUTES })}
          </span>
          <span className="shop-address">
            <FaMapMarkerAlt aria-hidden="true" />
            <span>{address ? t('deliverTo', { place: [address.area, address.city].filter(Boolean).join(', ') }) : t('setAddress')}</span>
            <FaChevronDown aria-hidden="true" />
          </span>
        </Link>
        <div className="desk-search">
          <SearchBox query={onSearchPage ? params.get('q') || '' : ''} onQueryChange={handleQuery} autoFocus={onSearchPage} />
        </div>
        <nav className="desk-links" aria-label={t('mainNav')}>
          <NavLink to="/orders">{t('navOrders')}</NavLink>
          {user ? (
            <NavLink to="/account" className="desk-account">
              <FaUserCircle aria-hidden="true" /> {t('navAccount')}
            </NavLink>
          ) : (
            <Link to={`/auth?next=${encodeURIComponent(pathname)}`}>{t('navLogin')}</Link>
          )}
        </nav>
        <Link to="/cart" className={`desk-cart ${count ? 'has-items' : ''}`} aria-label={`${t('cart')}: ${count === 1 ? t('cartItem') : t('cartItems', { n: count })}`}>
          <FaShoppingBasket aria-hidden="true" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={count}
              className="desk-cart-text"
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

      {!pathname.startsWith('/shop/category') && (
        <nav className="desk-categories" aria-label={t('categoriesLabel')}>
          {CATEGORIES.map((c) => (
            <NavLink key={c.id} to={`/shop/category/${c.id}`}>{t(c.labelKey)}</NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default DesktopHeader;
