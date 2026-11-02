import React from 'react';
import { Link } from 'react-router-dom';
import { FaBolt, FaChevronDown, FaMapMarkerAlt } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { EXPRESS_MINUTES } from '../../config/app';

// "Delivery in 45 min / Deliver to Area, City" – links to the address editor.
const DeliveryChip = ({ onNavigate, className = '' }) => {
  const { user, profile } = useAuth();
  const address = profile?.address;
  return (
    <Link to={user ? '/account#address' : '/auth?next=/account'} className={`shop-delivery ${className}`} onClick={onNavigate}>
      <span className="shop-eta">
        <FaBolt aria-hidden="true" /> {t('deliveryIn', { minutes: EXPRESS_MINUTES })}
      </span>
      <span className="shop-address">
        <FaMapMarkerAlt aria-hidden="true" />
        <span>{address ? t('deliverTo', { place: [address.area, address.city].filter(Boolean).join(', ') }) : t('setAddress')}</span>
        <FaChevronDown aria-hidden="true" />
      </span>
    </Link>
  );
};

export default DeliveryChip;
