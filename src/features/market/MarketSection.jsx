import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBoxOpen, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { catalog, CATEGORY_LABEL_KEYS } from '../../data/products';
import { searchProducts } from '../../utils/search';
import ProductSearch from './ProductSearch';
import ProductCard from './ProductCard';
import CartPanel from './CartPanel';
import OrderList from '../orders/OrderList';
import './MarketSection.css';

const MarketSection = () => {
  const { t } = useLanguage();
  const { orders, ordersLoading } = useShop();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  // Category names in the current language are searchable too ("सब्ज़ियाँ", "Spices").
  const categoryLabels = useMemo(
    () => Object.fromEntries(Object.entries(CATEGORY_LABEL_KEYS).map(([c, key]) => [c, t(key)])),
    [t]
  );
  const results = useMemo(
    () => searchProducts(catalog, query, { category, categoryLabels }),
    [query, category, categoryLabels]
  );

  useEffect(() => {
    if (!location.hash) return undefined;
    // Wait for the tab transition before scrolling to the cart or orders.
    const id = setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
    return () => clearTimeout(id);
  }, [location.hash]);

  return (
    <div className="page market-page">
      <header className="page-header">
        <h1 className="page-title">{t('market')}</h1>
        <p className="page-subtitle">{t('marketSubtitle')}</p>
      </header>

      <ProductSearch
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        resultCount={results.length}
      />

      {results.length > 0 ? (
        <motion.ul layout className="product-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((product, i) => (
              <motion.li
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: Math.min(i * 0.025, 0.3) } }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <ProductCard product={product} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <motion.div className="empty-state" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="empty-icon"><FaSearch aria-hidden="true" /></span>
          <p>{t('noResults', { q: query })}</p>
        </motion.div>
      )}

      <div className="grid grid-2 market-bottom">
        <CartPanel />
        <section className="card" id="orders" aria-labelledby="orders-title">
          <h2 id="orders-title" className="card-title">
            <span className="card-title-icon"><FaBoxOpen aria-hidden="true" /></span>
            {t('myOrders')}
          </h2>
          <OrderList orders={orders} loading={ordersLoading} />
        </section>
      </div>
    </div>
  );
};

export default MarketSection;
