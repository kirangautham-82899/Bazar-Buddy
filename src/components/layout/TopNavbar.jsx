import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { FaQuestionCircle, FaShoppingBasket } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import BrandMark from '../common/BrandMark';
import LanguageToggle from '../common/LanguageToggle';
import './TopNavbar.css';

const TopNavbar = () => {
  const { t } = useLanguage();
  const { cartCount } = useShop();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  // The bar turns solid with a shadow once the page scrolls under it.
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 8));

  return (
    <header className={`top-navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/dashboard" className="navbar-brand">
        <BrandMark />
      </Link>

      <div className="navbar-actions">
        <LanguageToggle short />
        <Link to="/dashboard/market#cart" className="icon-btn navbar-cart" aria-label={`${t('cart')} (${cartCount})`}>
          <FaShoppingBasket aria-hidden="true" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                className="cart-count"
                aria-hidden="true"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [1.5, 1], opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <Link to="/dashboard/help" className="icon-btn navbar-help" aria-label={t('navHelp')}>
          <FaQuestionCircle aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
};

export default TopNavbar;
