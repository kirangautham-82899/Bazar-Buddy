import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import vendorGroups from '../../data/vendorGroups';
import { deviationPct, fairPriceFor, isOverpriced } from '../../utils/pricing';
import { formatRupees, productName } from '../../utils/format';

export const QuantityStepper = ({ item, name }) => {
  const { t } = useLanguage();
  const { changeQuantity } = useShop();
  return (
    <div className="stepper">
      <button type="button" className="stepper-btn" onClick={() => changeQuantity(item.id, -1)} aria-label={t('decrease', { item: name })}>
        <FaMinus aria-hidden="true" />
      </button>
      <span className="stepper-value" aria-live="polite">{item.quantity}</span>
      <button type="button" className="stepper-btn" onClick={() => changeQuantity(item.id, 1)} aria-label={t('increase', { item: name })}>
        <FaPlus aria-hidden="true" />
      </button>
    </div>
  );
};

const FairPriceBadge = ({ product }) => {
  const { t } = useLanguage();
  const fair = fairPriceFor(product.id, vendorGroups, product.price);
  // Only shown where nearby groups give us something to compare against.
  if (!vendorGroups.some((g) => g.prices?.[product.id])) return null;
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

  return (
    <article className="product-card">
      <span className="product-emoji" aria-hidden="true">{product.emoji}</span>
      <h3 className="product-name">{name}</h3>
      <p className="product-price">
        <strong>{formatRupees(product.price)}</strong>
        <span className="muted">{t('perUnit', { unit: product.unit })}</span>
        {product.mrp && <s className="muted product-mrp">{formatRupees(product.mrp)}</s>}
      </p>
      <FairPriceBadge product={product} />
      <div className="product-action">
        {quantity > 0 ? (
          <QuantityStepper item={{ id: product.id, quantity }} name={name} />
        ) : (
          <button type="button" className="btn btn-sm btn-block" onClick={() => addToCart(product.id)}>
            <FaPlus aria-hidden="true" /> {t('add')}
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
