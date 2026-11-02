import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaTruck } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useCatalog } from '../../context/CatalogContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { useMyOrders } from '../../hooks/useMyOrders';
import CATEGORIES from '../../data/categories';
import { FREE_DELIVERY_ABOVE } from '../../config/app';
import { discountPct } from '../../utils/pricing';
import ProductIcon from '../../components/common/ProductIcon';
import { Stagger, staggerItem } from '../../components/motion';
import CatalogState from './CatalogState';
import ProductList from './ProductList';

// Rows show one line of products: 6 in a grid on desktop, 10 to swipe on phones.
const ROW_LIMIT = { desktop: 6, mobile: 10 };

// Products from past orders that are in stock again, most recent first.
const buyAgain = (orders, findProduct) => {
  const seen = new Set();
  return (orders || [])
    .filter((o) => o.status !== 'cancelled')
    .flatMap((o) => o.items)
    .filter((item) => !seen.has(item.id) && seen.add(item.id))
    .map((item) => findProduct(item.id))
    .filter((p) => p && p.stock > 0);
};

const ProductRow = ({ id, title, items, link, isDesktop }) => {
  const limit = isDesktop ? ROW_LIMIT.desktop : ROW_LIMIT.mobile;
  return (
    <section className="shop-row" aria-labelledby={id}>
      <div className="shop-row-head">
        <h2 id={id} className="shop-section-title">{title}</h2>
        {link && items.length > limit && (
          <Link to={link} className="see-all">
            {t('seeAll')} <FaChevronRight aria-hidden="true" />
          </Link>
        )}
      </div>
      <ProductList products={items.slice(0, limit)} layout={isDesktop ? 'grid' : 'row'} />
    </section>
  );
};

const ShopHome = () => {
  const { products, findProduct } = useCatalog();
  const orders = useMyOrders();
  const isDesktop = useIsDesktop();
  useDocumentMeta({ title: `${t('navHome')} – ${t('appName')}` });

  const deals = useMemo(
    () => products.filter((p) => p.stock > 0 && discountPct(p) > 0).sort((a, b) => discountPct(b) - discountPct(a)),
    [products]
  );
  const again = useMemo(() => buyAgain(orders, findProduct), [orders, findProduct]);
  const categoryRows = useMemo(
    () =>
      CATEGORIES.map((category) => ({ category, items: products.filter((p) => p.category === category.id) })).filter(
        (row) => row.items.length
      ),
    [products]
  );

  return (
    <div className="page shop-home">
      <motion.p className="promo-strip" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <FaTruck aria-hidden="true" /> {t('freeDeliveryBanner', { amount: FREE_DELIVERY_ABOVE })}
      </motion.p>

      <CatalogState />

      {categoryRows.length > 0 && (
        <>
          {/* Desktop has category links in the top bar, so the tiles are phone-only. */}
          {!isDesktop && (
            <section aria-labelledby="shop-categories">
              <h2 id="shop-categories" className="shop-section-title">{t('shopByCategory')}</h2>
              <Stagger as="ul" className="category-tiles" stagger={0.04}>
                {CATEGORIES.map((category) => (
                  <motion.li key={category.id} variants={staggerItem} whileTap={{ scale: 0.95 }}>
                    <Link to={`/shop/category/${category.id}`}>
                      <ProductIcon icon={category.icon} category={category.id} size="lg" />
                      <span>{t(category.labelKey)}</span>
                    </Link>
                  </motion.li>
                ))}
              </Stagger>
            </section>
          )}

          {again.length > 0 && <ProductRow id="row-buy-again" title={t('buyAgainTitle')} items={again} isDesktop={isDesktop} />}
          {deals.length > 0 && <ProductRow id="row-deals" title={t('dealsTitle')} items={deals} isDesktop={isDesktop} />}
          {categoryRows.map(({ category, items }) => (
            <ProductRow
              key={category.id}
              id={`row-${category.id}`}
              title={t(category.labelKey)}
              items={items}
              link={`/shop/category/${category.id}`}
              isDesktop={isDesktop}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ShopHome;
