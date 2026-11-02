import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { FaQuestionCircle, FaShoppingBasket } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import logoAnim from '../../assets/animations/shopping.json';
import './TopNavbar.css';

const TopNavbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { cartCount } = useShop();

  return (
    <header className="top-navbar">
      <Link to="/dashboard" className="navbar-brand">
        <Lottie animationData={logoAnim} loop className="navbar-logo" aria-hidden="true" />
        <span className="brand-name">{t('appName')}</span>
      </Link>

      <div className="navbar-actions">
        <label htmlFor="language-select" className="visually-hidden">{t('languageLabel')}</label>
        <select
          id="language-select"
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
        <Link to="/dashboard/market#cart" className="icon-btn navbar-cart" aria-label={`${t('cart')} (${cartCount})`}>
          <FaShoppingBasket aria-hidden="true" />
          {cartCount > 0 && <span className="cart-count" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span>}
        </Link>
        <Link to="/dashboard/help" className="icon-btn" aria-label={t('navHelp')}>
          <FaQuestionCircle aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
};

export default TopNavbar;
