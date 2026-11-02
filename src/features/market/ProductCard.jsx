import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import vendorGroups from '../../data/vendorGroups';
import { deviationPct, fairPriceFor, isOverpriced } from '../../utils/pricing';
import { formatRupees, productName } from '../../utils/format';
import ProductIcon from '../../components/common/ProductIcon';

export const QuantityStepper = ({ item, name, compact = false }) => {
  const { t } = useLanguage();
  const { changeQuantity } = useShop();
  return (
    <div className={`stepper ${compact ? 'stepper-compact' : ''}`}>
      <motion.button whileTap={{ scale: 0.8 }} type="button" className="stepper-btn" onClick={() => changeQuantity(item.id, -1)} aria-label={t('decrease', { item: name })}>
        <FaMinus aria-hidden="true" />
      </motion.button>
      <span className="stepper-value" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={item.quantity}
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {item.quantity}
          </motion.span>
        </AnimatePresence>
      </span>
      <motion.button whileTap={{ scale: 0.8 }} type="button" className="stepper-btn" onClick={() => changeQuantity(item.id, 1)} aria-label={t('increase', { item: name })}>
        <FaPlus aria-hidden="true" />
      </motion.button>
    </div>
  );
};

const FairPriceBadge = ({ product }) => {
  const { t } = useLanguage();
  // Only shown where nearby groups give us something to compare against.
  if (!vendorGroups.some((g) => g.prices?.[product.id])) return null;
  const fair = fairPriceFor(product.id, vendorGroups, product.price);
  if (isOverpriced(product.price, fair)) {
    return <span className="badge badge-warning">{t('aboveFair', { pct: deviationPct(product.price, fair) })}</span>;
  }
  return <span className="badge badge-success" title={`${t('fairPrice')}: ${formatRupees(fair)}`}>✓ {t('belowFair')}</span>;
};

const ProductCard = ({ product }) => {
  const { t, language } = useLanguage();
  const { quantityOf, addToCart } = useShop();
  const quantity = quantityOf(product.id);
  const name = productName(product, language);
  const savePct = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <motion.article
      className={`product-card ${quantity ? 'in-cart' : ''}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {savePct > 0 && <span className="product-ribbon">−{savePct}%</span>}
      <ProductIcon id={product.id} category={product.category} size="lg" />
      <h3 className="product-name">{name}</h3>
      <p className="product-price">
        <strong>{formatRupees(product.price)}</strong>
        <span className="muted">{t('perUnit', { unit: product.unit })}</span>
        {product.mrp && <s className="muted product-mrp">{formatRupees(product.mrp)}</s>}
      </p>
      <FairPriceBadge product={product} />
      <div className="product-action">
        <AnimatePresence mode="wait" initial={false}>
          {quantity > 0 ? (
            <motion.div key="stepper" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}>
              <QuantityStepper item={{ id: product.id, quantity }} name={name} />
            </motion.div>
          ) : (
            <motion.button
              key="add"
              type="button"
              className="btn btn-sm btn-block"
              onClick={() => addToCart(product.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.15 }}
            >
              <FaPlus aria-hidden="true" /> {t('add')}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

export default ProductCard;
