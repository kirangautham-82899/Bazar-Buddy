import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBolt, FaChevronDown, FaMapMarkerAlt, FaUserCircle } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { EXPRESS_MINUTES } from '../../config/app';
import BrandMark from '../../components/common/BrandMark';
import SearchBox from './SearchBox';

// Delivery time + address on the left (like Instamart), account on the right, search below.
const ShopHeader = () => {
  const { user, profile } = useAuth();
  const { pathname } = useLocation();
  const address = profile?.address;
  const showSearch = pathname.startsWith('/shop') && pathname !== '/shop/search';

  return (
    <header className="shop-header">
      <div className="shop-header-row">
        <Link to="/shop" className="shop-brand" aria-label={t('appName')}>
          <BrandMark compact />
        </Link>
        <Link to={user ? '/account#address' : '/auth?next=/account'} className="shop-delivery">
          <span className="shop-eta">
            <FaBolt aria-hidden="true" /> {t('deliveryIn', { minutes: EXPRESS_MINUTES })}
          </span>
          <span className="shop-address">
            <FaMapMarkerAlt aria-hidden="true" />
            <span>{address ? t('deliverTo', { place: [address.area, address.city].filter(Boolean).join(', ') }) : t('setAddress')}</span>
            <FaChevronDown aria-hidden="true" />
          </span>
        </Link>
        {user ? (
          <Link to="/account" className="icon-btn" aria-label={t('navAccount')}>
            <FaUserCircle aria-hidden="true" />
          </Link>
        ) : (
          <Link to="/auth" className="btn btn-sm">{t('navLogin')}</Link>
        )}
      </div>
      {showSearch && <SearchBox asLink />}
    </header>
  );
};

export default ShopHeader;
