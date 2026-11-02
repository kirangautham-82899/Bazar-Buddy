import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useCart } from '../../context/CartContext';

// − qty + control. The number rolls up or down as it changes.
const QuantityStepper = ({ product, quantity, size = 'md' }) => {
  const { changeQuantity } = useCart();
  const atMax = quantity >= (product.stock ?? 0);
  return (
    <div className={`stepper stepper-${size}`}>
      <motion.button whileTap={{ scale: 0.8 }} type="button" className="stepper-btn" onClick={() => changeQuantity(product.id, -1)} aria-label={t('decrease', { item: product.name })}>
        <FaMinus aria-hidden="true" />
      </motion.button>
      <span className="stepper-value" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={quantity} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
            {quantity}
          </motion.span>
        </AnimatePresence>
      </span>
      <motion.button
        whileTap={{ scale: 0.8 }}
        type="button"
        className="stepper-btn"
        onClick={() => changeQuantity(product.id, 1)}
        disabled={atMax}
        aria-label={atMax ? t('maxStock', { n: product.stock }) : t('increase', { item: product.name })}
      >
        <FaPlus aria-hidden="true" />
      </motion.button>
    </div>
  );
};

export default QuantityStepper;
