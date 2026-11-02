import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaShoppingBasket, FaUserCircle } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatRupees } from '../../utils/format';
import SearchBox from './SearchBox';

// Desktop top bar next to the sidebar: live search, account and cart.
const DesktopTopBar = () => {
  const { user, profile } = useAuth();
  const { count, totals } = useCart();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const onSearchPage = pathname === '/shop/search';

  // Typing anywhere jumps to the search page; the query lives in the URL.
  const handleQuery = (q) => navigate(q ? `/shop/search?q=${encodeURIComponent(q)}` : '/shop/search', { replace: onSearchPage });

  return (
    <header className="desk-topbar">
      <div className="desk-search">
        <SearchBox query={onSearchPage ? params.get('q') || '' : ''} onQueryChange={handleQuery} autoFocus={onSearchPage} />
      </div>
      {user ? (
        <Link to="/account" className="desk-account">
          <FaUserCircle aria-hidden="true" />
          <span>{profile?.name?.split(' ')[0] || t('navAccount')}</span>
        </Link>
      ) : (
        <Link to={`/auth?next=${encodeURIComponent(pathname)}`} className="btn btn-sm btn-outline">{t('navLogin')}</Link>
      )}
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
    </header>
  );
};

export default DesktopTopBar;
