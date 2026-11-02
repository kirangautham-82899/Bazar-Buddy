import React from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { FaArrowLeft, FaBoxes, FaClipboardList } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import BrandMark from '../../components/common/BrandMark';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import './admin.css';

const AdminLayout = () => {
  useDocumentMeta({ title: `${t('admin')} – ${t('appName')}`, noindex: true });
  return (
    <div className="admin">
      <header className="admin-header">
        <Link to="/shop" className="admin-back" aria-label={t('navHome')}>
          <FaArrowLeft aria-hidden="true" />
          <BrandMark compact />
          <strong>{t('admin')}</strong>
        </Link>
        <nav className="admin-tabs" aria-label={t('admin')}>
          <NavLink to="/admin" end className="admin-tab">
            <FaClipboardList aria-hidden="true" /> {t('adminOrders')}
          </NavLink>
          <NavLink to="/admin/products" className="admin-tab">
            <FaBoxes aria-hidden="true" /> {t('adminProducts')}
          </NavLink>
        </nav>
      </header>
      <main className="admin-main">
        <Routes>
          <Route index element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
