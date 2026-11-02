import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt } from 'react-icons/fa';
import { t } from '../../../content/strings';
import { SUPPORT_PHONE, TOLL_FREE } from '../../../config/app';
import BrandMark from '../../../components/common/BrandMark';
import { FOOTER_COLUMNS } from '../content';
import { warmAuthProps } from '../warmAuth';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-brand">
        <BrandMark />
        <p>{t('footerTagline')}</p>
      </div>
      {FOOTER_COLUMNS.map((column) => (
        <nav key={column.title} className="footer-col" aria-label={t(column.title)}>
          <h2>{t(column.title)}</h2>
          {column.links.map((link) =>
            link.to ? (
              <Link key={link.to} to={link.to} {...warmAuthProps}>{t(link.label)}</Link>
            ) : (
              <a key={link.href} href={link.href}>{t(link.label)}</a>
            )
          )}
        </nav>
      ))}
      <div className="footer-col">
        <h2>{t('footerContact')}</h2>
        <a href={`tel:${SUPPORT_PHONE}`}>
          <FaPhoneAlt aria-hidden="true" /> {t('callSupport')}
        </a>
        <a href={`tel:${TOLL_FREE.replace(/-/g, '')}`}>{TOLL_FREE}</a>
      </div>
      <p className="footer-rights">{t('footerRights', { year: new Date().getFullYear() })}</p>
    </footer>
  );
};

export default Footer;
