import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeadset } from 'react-icons/fa';
import { t } from '../../content/strings';
import CATEGORIES from '../../data/categories';
import { SUPPORT_PHONE } from '../../config/app';
import BrandMark from '../../components/common/BrandMark';

// Desktop footer: what Bazar Buddy is, shop links and how to reach support.
const DesktopFooter = () => (
  <footer className="df">
    <div className="df-inner">
      <div className="df-about">
        <BrandMark />
        <p>{t('footerTagline')}</p>
      </div>
      <nav aria-label={t('footerShop')}>
        <h2>{t('footerShop')}</h2>
        {CATEGORIES.slice(0, 5).map((c) => (
          <Link key={c.id} to={`/shop/category/${c.id}`}>{t(c.labelKey)}</Link>
        ))}
      </nav>
      <nav aria-label={t('footerHelp')}>
        <h2>{t('footerHelp')}</h2>
        <Link to="/markets">{t('navMarkets')}</Link>
        <Link to="/orders">{t('navOrders')}</Link>
        <Link to="/account">{t('navAccount')}</Link>
      </nav>
      <div className="df-contact">
        <h2>{t('factSupportTitle')}</h2>
        <a href={`tel:${SUPPORT_PHONE}`} className="df-call">
          <FaHeadset aria-hidden="true" /> {t('callSupport')}
        </a>
        <small>{t('supportHours')}</small>
      </div>
    </div>
    <p className="df-legal">{t('footerRights', { year: new Date().getFullYear() })}</p>
  </footer>
);

export default DesktopFooter;
