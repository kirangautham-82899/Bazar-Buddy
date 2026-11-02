import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { t } from '../../content/strings';
import { useCart } from '../../context/CartContext';
import { findCategory } from '../../data/categories';
import { PRODUCT_MARKET_ITEM } from '../../data/mandis';
import ProductIcon from '../../components/common/ProductIcon';
import Modal from '../../components/common/Modal';
import { discountPct } from '../../utils/pricing';
import { formatRupees } from '../../utils/format';
import QuantityStepper from './QuantityStepper';

const LOW_STOCK = 5;

const stockLabel = (stock) => {
  if (stock <= 0) return { text: t('outOfStock'), tone: 'badge-danger' };
  if (stock <= LOW_STOCK) return { text: t('onlyLeft', { n: stock }), tone: 'badge-warning' };
  return { text: t('inStock'), tone: 'badge-success' };
};

// Bottom sheet on phones, centred dialog on desktop (the Modal handles both).
const ProductDetails = ({ product, open, onClose }) => {
  const { quantityOf, changeQuantity } = useCart();
  const quantity = quantityOf(product.id);
  const off = discountPct(product);
  const stock = stockLabel(product.stock);
  const category = findCategory(product.category);

  return (
    <Modal open={open} title={product.name} onClose={onClose}>
      <div className="product-details">
        <motion.div className="product-details-media" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
          <ProductIcon icon={product.icon} category={product.category} size="hero" />
          {off > 0 && <span className="product-off">{t('off', { pct: off })}</span>}
        </motion.div>

        <div className="product-details-info">
          <p className="product-details-unit">1 {product.unit}</p>
          <p className="product-details-price">
            <strong>{formatRupees(product.price)}</strong>
            {product.mrp > product.price && (
              <>
                <s>{formatRupees(product.mrp)}</s>
                <span className="product-details-save">{t('youSave', { amount: formatRupees(product.mrp - product.price) })}</span>
              </>
            )}
          </p>
          <span className={`badge ${stock.tone}`}>{stock.text}</span>
          {product.description && <p className="product-details-desc">{product.description}</p>}
          <div className="product-details-links">
            {category && (
              <Link to={`/shop/category/${category.id}`} className="see-all" onClick={onClose}>
                {t('moreIn', { category: t(category.labelKey) })}
              </Link>
            )}
            {PRODUCT_MARKET_ITEM[product.id] && (
              <Link to={`/markets?item=${encodeURIComponent(PRODUCT_MARKET_ITEM[product.id])}`} className="see-all" onClick={onClose}>
                {t('seeMandiPrices')}
              </Link>
            )}
          </div>
        </div>

        {product.stock > 0 && (
          <div className="product-details-action">
            <AnimatePresence mode="wait" initial={false}>
              {quantity > 0 ? (
                <motion.div key="stepper" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <QuantityStepper product={product} quantity={quantity} size="lg" />
                </motion.div>
              ) : (
                <motion.button
                  key="add"
                  type="button"
                  className="btn btn-lg btn-block"
                  onClick={() => changeQuantity(product.id, 1)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('addToCart')}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductDetails;
