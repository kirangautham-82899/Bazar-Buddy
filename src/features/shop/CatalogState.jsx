import React from 'react';
import { Link } from 'react-router-dom';
import { FaStoreAlt } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { Skeleton } from '../../components/motion';

// Loading shimmer, or a friendly "being stocked" message when the catalog is empty.
// Returns null when there are products to show.
const CatalogState = () => {
  const { products, loading } = useCatalog();
  const { isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="catalog-skeleton" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton-card">
            <span className="skeleton skeleton-media" />
            <Skeleton lines={2} />
          </div>
        ))}
      </div>
    );
  }
  if (products.length) return null;
  return (
    <div className="empty-state catalog-empty">
      <span className="empty-icon"><FaStoreAlt aria-hidden="true" /></span>
      <h2>{t('catalogEmptyTitle')}</h2>
      <p>{t('catalogEmptyBody')}</p>
      {isAdmin && <Link to="/admin/products" className="btn btn-sm">{t('catalogEmptyAdmin')}</Link>}
    </div>
  );
};

export default CatalogState;
