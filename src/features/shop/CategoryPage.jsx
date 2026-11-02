import React, { useMemo } from 'react';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { t } from '../../content/strings';
import { useCatalog } from '../../context/CatalogContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import CATEGORIES, { findCategory } from '../../data/categories';
import ProductIcon from '../../components/common/ProductIcon';
import PageHead from '../../components/common/PageHead';
import CatalogState from './CatalogState';
import ProductList from './ProductList';

// Instamart-style: category rail on the left, products for the chosen one on the right.
const CategoryPage = () => {
  const { categoryId } = useParams();
  const { products, loading } = useCatalog();
  const category = findCategory(categoryId);
  useDocumentMeta({ title: `${category ? t(category.labelKey) : ''} – ${t('appName')}` });

  const items = useMemo(() => products.filter((p) => p.category === categoryId), [products, categoryId]);
  if (!category) return <Navigate to={`/shop/category/${CATEGORIES[0].id}`} replace />;

  return (
    <div className="category-page">
      <nav className="category-rail" aria-label={t('categoriesLabel')}>
        {CATEGORIES.map((c) => (
          <NavLink key={c.id} to={`/shop/category/${c.id}`} className="rail-item">
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="rail-indicator" className="rail-indicator" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <ProductIcon icon={c.icon} category={c.id} size="sm" />
                <span>{t(c.labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <section className="category-content" aria-labelledby="category-title">
        <PageHead id="category-title" title={t(category.labelKey)} subtitle={items.length ? t('itemsCount', { n: items.length }) : null} />
        {!loading && products.length > 0 && !items.length ? (
          <p className="empty-state">{t('categoryEmpty')}</p>
        ) : (
          <>
            <CatalogState />
            <ProductList products={items} />
          </>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
