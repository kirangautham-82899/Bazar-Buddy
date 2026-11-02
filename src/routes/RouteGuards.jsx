import React from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { t } from '../content/strings';

// Sends guests to login, then back to where they were.
export const ProtectedRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <Loader fullScreen />;
  if (!user) return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
};

// Login screen: signed-in vendors go straight to `next` (only same-site paths) or the shop.
export const PublicOnlyRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  const [params] = useSearchParams();
  if (initializing) return <Loader fullScreen />;
  if (user) {
    const next = params.get('next');
    return <Navigate to={next && next.startsWith('/') && !next.startsWith('//') ? next : '/shop'} replace />;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  if (isAdmin === null) return <Loader fullScreen />;
  if (!isAdmin) {
    return (
      <main className="screen-center">
        <h1 className="page-title">{t('notAdminTitle')}</h1>
        <p className="muted" style={{ maxWidth: 420 }}>{t('notAdminBody')}</p>
      </main>
    );
  }
  return children;
};
