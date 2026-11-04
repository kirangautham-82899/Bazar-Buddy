import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronDown, FaShoppingBasket, FaThLarge, FaUserCircle } from 'react-icons/fa';
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

// "Categories" button with a dropdown of every category. Closes on Escape,
// an outside click or after choosing one.
const CategoryMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div className="dh-menu" ref={ref}>
      <button
        type="button"
        className={`dh-link dh-menu-btn ${pathname.startsWith('/shop/category') ? 'active' : ''}`}
        aria-expanded={open}
        aria-controls="dh-categories"
        onClick={() => setOpen((v) => !v)}
      >
        <FaThLarge aria-hidden="true" /> {t('categoriesLabel')} <FaChevronDown aria-hidden="true" className="dh-menu-chevron" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="dh-categories"
            className="dh-menu-panel"
            aria-label={t('categoriesLabel')}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {CATEGORIES.map((c) => (
              <NavLink key={c.id} to={`/shop/category/${c.id}`} className="dh-menu-item">
                <ProductIcon icon={c.icon} category={c.id} size="sm" />
                <span>{t(c.labelKey)}</span>
              </NavLink>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

// Desktop header. Top row: brand, delivery address, search, account and cart.
// Bottom row: the main sections, a categories menu and the assistant.
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
          <CategoryMenu />
          <nav className="dh-nav" aria-label={t('mainNav')}>
            {links.map(({ to, end, label }) => (
              <NavLink key={to} to={to} end={end} className="dh-link">
                {t(label)}
              </NavLink>
            ))}
          </nav>
          <button type="button" className="dh-ai" onClick={openAssistant}>
            <HiSparkles aria-hidden="true" />
            <span>{t('assistantAsk')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
