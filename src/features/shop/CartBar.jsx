import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronRight, FaShoppingBasket } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useCart } from '../../context/CartContext';
import { formatRupees } from '../../utils/format';

// Floating "N items · ₹total · View cart" bar, shown while shopping with a non-empty cart.
const CartBar = () => {
  const { count, totals } = useCart();
  const { pathname } = useLocation();
  const visible = count > 0 && pathname.startsWith('/shop');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cart-bar-wrap"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          <Link to="/cart" className="cart-bar">
            <span className="cart-bar-icon" aria-hidden="true"><FaShoppingBasket /></span>
            <span className="cart-bar-summary">
              <motion.strong key={count} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                {count === 1 ? t('cartItem') : t('cartItems', { n: count })}
              </motion.strong>
              <span>{formatRupees(totals.itemTotal)}</span>
            </span>
            <span className="cart-bar-cta">
              {t('viewCart')} <FaChevronRight aria-hidden="true" />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartBar;
