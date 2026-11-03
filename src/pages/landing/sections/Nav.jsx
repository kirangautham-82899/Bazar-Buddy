import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../../content/strings';
import BrandMark from '../../../components/common/BrandMark';
import { NAV_LINKS } from '../content';
import { warmAuthProps } from '../warmAuth';
import './Nav.css';

const Nav = () => (
  <header className="landing-nav">
    <div className="landing-nav-inner">
      <Link to="/" className="landing-brand" aria-label={t('appName')}>
        <BrandMark />
      </Link>
      <nav className="landing-links" aria-label={t('mainNav')}>
        {NAV_LINKS.map(({ href, label }) => (
          <a key={href} href={href}>{t(label)}</a>
        ))}
      </nav>
      <div className="landing-nav-actions">
        <Link to="/auth" className="btn btn-sm btn-ghost" {...warmAuthProps}>
          {t('navLogin')}
        </Link>
        <Link to="/shop" className="btn btn-sm" {...warmAuthProps}>
          {t('startShopping')}
        </Link>
      </div>
    </div>
  </header>
);

export default Nav;
