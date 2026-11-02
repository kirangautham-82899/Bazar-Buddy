import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { t } from '../../content/strings';
import { useCart } from '../../context/CartContext';
import ProductIcon from '../../components/common/ProductIcon';
import { discountPct } from '../../utils/pricing';
import { formatRupees } from '../../utils/format';
import QuantityStepper from './QuantityStepper';

const LOW_STOCK = 5;

const ProductCard = ({ product }) => {
  const { quantityOf, changeQuantity } = useCart();
  const quantity = quantityOf(product.id);
  const soldOut = product.stock <= 0;
  const off = discountPct(product);

  return (
    <motion.article className={`product-card ${soldOut ? 'sold-out' : ''}`} whileHover={soldOut ? undefined : { y: -3 }}>
      <div className="product-media">
        {off > 0 && <span className="product-off">{t('off', { pct: off })}</span>}
        <ProductIcon icon={product.icon} category={product.category} size="xl" />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-unit">
        1 {product.unit}
        {!soldOut && product.stock <= LOW_STOCK && <span className="product-low"> · {t('onlyLeft', { n: product.stock })}</span>}
      </p>
      <div className="product-foot">
        <p className="product-price">
          <strong>{formatRupees(product.price)}</strong>
          {product.mrp > product.price && <s>{formatRupees(product.mrp)}</s>}
        </p>
        {soldOut ? (
          <span className="product-soldout">{t('outOfStock')}</span>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {quantity > 0 ? (
              <motion.div key="stepper" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.15 }}>
                <QuantityStepper product={product} quantity={quantity} size="sm" />
              </motion.div>
            ) : (
              <motion.button
                key="add"
                type="button"
                className="add-btn"
                onClick={() => changeQuantity(product.id, 1)}
                aria-label={`${t('add')} ${product.name}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                {t('add')}
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.article>
  );
};

export default ProductCard;
