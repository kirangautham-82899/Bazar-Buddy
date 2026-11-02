import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { catalog, CATEGORY_LABEL_KEYS } from '../../data/products';
import { searchProducts } from '../../utils/search';
import ProductSearch from './ProductSearch';
import ProductCard from './ProductCard';
import CartPanel from './CartPanel';
import OrderList from './OrderList';
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
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="page market-page">
      <h1 className="page-title">{t('market')}</h1>

      <ProductSearch
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        resultCount={results.length}
      />

      {results.length > 0 ? (
        <ul className="product-grid">
          {results.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">{t('noResults', { q: query })}</p>
      )}

      <div className="grid grid-2 market-bottom">
        <CartPanel />
        <section className="card" id="orders" aria-labelledby="orders-title">
          <h2 id="orders-title" className="card-title">📦 {t('myOrders')}</h2>
          <OrderList orders={orders} loading={ordersLoading} />
        </section>
      </div>
    </div>
  );
};

export default MarketSection;
