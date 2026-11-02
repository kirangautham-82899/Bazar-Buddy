import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import BrandMark from '../../../components/common/BrandMark';
import LanguageToggle from '../../../components/common/LanguageToggle';
import { NAV_LINKS } from '../content';
import { warmAuthProps } from '../warmAuth';
import './Nav.css';

const Nav = () => {
  const { t } = useLanguage();
  return (
    <header className="landing-nav">
      <Link to="/" className="landing-brand" aria-label={t('appName')}>
        <BrandMark />
      </Link>
      <nav className="landing-links" aria-label={t('mainNav')}>
        {NAV_LINKS.map(({ href, label }) => (
          <a key={href} href={href}>{t(label)}</a>
        ))}
      </nav>
      <div className="landing-nav-actions">
        <LanguageToggle short />
        <Link to="/auth" className="btn btn-sm" {...warmAuthProps}>
          {t('navLogin')}
        </Link>
      </div>
    </header>
  );
};

export default Nav;
