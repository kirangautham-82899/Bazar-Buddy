import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useCatalog } from '../../context/CatalogContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import CATEGORIES from '../../data/categories';
import { searchProducts } from '../../utils/search';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import SearchBox from './SearchBox';
import PageHead from '../../components/common/PageHead';
import CatalogState from './CatalogState';
import ProductList from './ProductList';

// The query lives in the URL (?q=) so results survive refresh and can be shared.
const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const { products } = useCatalog();
  const isDesktop = useIsDesktop();
  useDocumentMeta({ title: `${t('searchLabel')} – ${t('appName')}` });

  const categoryLabels = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, t(c.labelKey)])), []);
  const results = useMemo(() => (query.trim() ? searchProducts(products, query, { categoryLabels }) : []), [products, query, categoryLabels]);

  const setQuery = (q) => setParams(q ? { q } : {}, { replace: true });

  return (
    <div className="page search-page">
      {/* On desktop the search box lives in the top bar. */}
      {isDesktop ? <PageHead title={t('searchLabel')} subtitle={t('searchHint')} /> : <SearchBox query={query} onQueryChange={setQuery} autoFocus />}
      <CatalogState />
      {query.trim() ? (
        <>
          <p className="search-count muted" aria-live="polite">
            {results.length ? t('resultsCount', { n: results.length }) : t('noResults', { q: query })}
          </p>
          <ProductList products={results} />
        </>
      ) : (
        products.length > 0 && (
          <p className="empty-state">
            <span className="empty-icon"><FaSearch aria-hidden="true" /></span>
            {t('searchHint')}
          </p>
        )
      )}
    </div>
  );
};

export default SearchPage;
