import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import DeliveryChip from './DeliveryChip';
import MobileDrawer from './MobileDrawer';
import SearchBox from './SearchBox';

// Phone header: menu button (opens the side drawer), delivery address, account, and search below.
const ShopHeader = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const showSearch = pathname.startsWith('/shop') && pathname !== '/shop/search';

  return (
    <header className="shop-header">
      <div className="shop-header-row">
        <button type="button" className="icon-btn" onClick={() => setMenuOpen(true)} aria-label={t('menu')} aria-expanded={menuOpen}>
          <FaBars aria-hidden="true" />
        </button>
        <DeliveryChip />
        {user ? (
          <Link to="/account" className="icon-btn" aria-label={t('navAccount')}>
            <FaUserCircle aria-hidden="true" />
          </Link>
        ) : (
          <Link to={`/auth?next=${encodeURIComponent(pathname)}`} className="btn btn-sm">{t('navLogin')}</Link>
        )}
      </div>
      {showSearch && <SearchBox asLink />}
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
};

export default ShopHeader;
