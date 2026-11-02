import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaTruck } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useCatalog } from '../../context/CatalogContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import CATEGORIES from '../../data/categories';
import { FREE_DELIVERY_ABOVE } from '../../config/app';
import ProductIcon from '../../components/common/ProductIcon';
import { Stagger, staggerItem } from '../../components/motion';
import CatalogState from './CatalogState';
import ProductList from './ProductList';

const ROW_SIZE = 10;

const ShopHome = () => {
  const { products } = useCatalog();
  useDocumentMeta({ title: `${t('navHome')} – ${t('appName')}` });

  // Only categories that have products, each as a sideways-scrolling row.
  const rows = useMemo(
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

      {rows.length > 0 && (
        <>
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

          {rows.map(({ category, items }) => (
            <section key={category.id} className="shop-row" aria-labelledby={`row-${category.id}`}>
              <div className="shop-row-head">
                <h2 id={`row-${category.id}`} className="shop-section-title">{t(category.labelKey)}</h2>
                {items.length > ROW_SIZE && (
                  <Link to={`/shop/category/${category.id}`} className="see-all">
                    {t('seeAll')} <FaChevronRight aria-hidden="true" />
                  </Link>
                )}
              </div>
              <ProductList products={items.slice(0, ROW_SIZE)} layout="row" />
            </section>
          ))}
        </>
      )}
    </div>
  );
};

export default ShopHome;
