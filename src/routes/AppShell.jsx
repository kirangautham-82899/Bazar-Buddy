// Everything behind the landing page: Firebase, auth, catalog, cart, the shop,
// checkout, orders, account and admin. Kept in its own chunk so the landing page
// never downloads Firebase.
import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { isFirebaseConfigured } from '../config/firebase';
import { AuthProvider } from '../context/AuthContext';
import { CatalogProvider } from '../context/CatalogContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import Loader from '../components/common/Loader';
import SetupScreen from '../components/common/SetupScreen';
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './RouteGuards';
import {
  loadAccountPage,
  loadAdmin,
  loadAuthPage,
  loadCartPage,
  loadCategoryPage,
  loadMarketsPage,
  loadOrdersPage,
  loadSearchPage,
  loadShopHome,
  loadShopLayout,
} from './lazy';

const AuthPage = lazy(loadAuthPage);
const ShopLayout = lazy(loadShopLayout);
const ShopHome = lazy(loadShopHome);
const CategoryPage = lazy(loadCategoryPage);
const SearchPage = lazy(loadSearchPage);
const CartPage = lazy(loadCartPage);
const OrdersPage = lazy(loadOrdersPage);
const AccountPage = lazy(loadAccountPage);
const MarketsPage = lazy(loadMarketsPage);
const AdminLayout = lazy(loadAdmin);

const AppShell = () => {
  if (!isFirebaseConfigured) return <SetupScreen />;
  return (
    <ToastProvider>
      <AuthProvider>
        <CatalogProvider>
          <CartProvider>
            <Suspense fallback={<Loader fullScreen />}>
              <Routes>
                <Route path="auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />

                {/* Public: anyone can browse and fill a cart */}
                <Route element={<ShopLayout />}>
                  <Route path="shop" element={<ShopHome />} />
                  <Route path="shop/category/:categoryId" element={<CategoryPage />} />
                  <Route path="shop/search" element={<SearchPage />} />
                  <Route path="markets" element={<MarketsPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                </Route>

                <Route path="admin/*" element={<ProtectedRoute><AdminRoute><AdminLayout /></AdminRoute></ProtectedRoute>} />

                {/* Old dashboard links from before the shop */}
                <Route path="dashboard/*" element={<Navigate to="/shop" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </CatalogProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default AppShell;
