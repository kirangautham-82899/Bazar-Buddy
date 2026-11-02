import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useToast } from '../../context/ToastContext';
import { findCategory } from '../../data/categories';
import starterCatalog from '../../data/starterCatalog';
import { importStarterCatalog, saveProduct, subscribeAllProducts } from '../../services/catalogService';
import { searchProducts } from '../../utils/search';
import { formatRupees } from '../../utils/format';
import ProductIcon from '../../components/common/ProductIcon';
import Modal from '../../components/common/Modal';
import { Skeleton } from '../../components/motion';
import ProductForm from './ProductForm';

const AdminProducts = () => {
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // product, 'new', or null
  const [importing, setImporting] = useState(false);

  useEffect(() => subscribeAllProducts(setProducts, (err) => {
    console.error(err);
    setProducts([]);
  }), []);

  const visible = useMemo(() => searchProducts(products || [], query), [products, query]);

  const toggleActive = async (product) => {
    try {
      await saveProduct({ ...product, active: !product.active });
    } catch (err) {
      console.error(err);
      toast.show(t('errGeneric'), 'error');
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      toast.show(t('imported', { n: await importStarterCatalog() }));
    } catch (err) {
      console.error(err);
      toast.show(t('errGeneric'), 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <label className="admin-search">
          <FaSearch aria-hidden="true" />
          <span className="visually-hidden">{t('searchProducts')}</span>
          <input type="search" className="input" placeholder={t('searchProducts')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="button" className="btn" onClick={() => setEditing('new')}>
          <FaPlus aria-hidden="true" /> {t('addProduct')}
        </button>
      </div>

      {products === null ? (
        <Skeleton lines={6} />
      ) : products.length === 0 ? (
        <div className="empty-state admin-import">
          <p>{t('noProducts')}</p>
          <p className="small">{t('importStarterBody', { n: starterCatalog.length })}</p>
          <button type="button" className="btn btn-secondary" onClick={handleImport} disabled={importing}>
            {importing && <span className="btn-spinner" aria-hidden="true" />}
            {t('importStarter')}
          </button>
        </div>
      ) : (
        <ul className="admin-products">
          {visible.map((product) => (
            <motion.li key={product.id} layout className={`admin-product ${product.active ? '' : 'inactive'}`}>
              <ProductIcon icon={product.icon} category={product.category} size="sm" />
              <button type="button" className="admin-product-main" onClick={() => setEditing(product)}>
                <strong>{product.name}</strong>
                <span className="muted small">
                  {t(findCategory(product.category)?.labelKey || 'category')} · {formatRupees(product.price)}{t('perUnit', { unit: product.unit })}
                  {product.mrp > product.price && <> · <s>{formatRupees(product.mrp)}</s></>}
                </span>
              </button>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                {product.stock > 0 ? t('inStockCount', { n: product.stock }) : t('outOfStock')}
              </span>
              <label className="switch" title={t('active')}>
                <input type="checkbox" checked={product.active} onChange={() => toggleActive(product)} />
                <span className="switch-track" aria-hidden="true" />
                <span className="visually-hidden">{t('active')}: {product.name}</span>
              </label>
            </motion.li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(editing)} title={editing === 'new' ? t('addProduct') : t('editProduct')} onClose={() => setEditing(null)}>
        {editing && <ProductForm product={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
};

export default AdminProducts;
