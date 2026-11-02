// Everything behind the landing page: Firebase, auth, toasts, login and the
// dashboard. Kept in its own chunk so the landing page never downloads Firebase.
import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { isFirebaseConfigured } from '../config/firebase';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ProtectedRoute, PublicOnlyRoute } from '../components/layout/RouteGuards';
import Loader from '../components/common/Loader';
import SetupScreen from '../components/common/SetupScreen';
import {
  loadAuthPage,
  loadDashboardPage,
  loadHelp,
  loadHome,
  loadMarket,
  loadProfile,
  loadTrade,
  loadWallet,
} from './lazy';

const AuthPage = lazy(loadAuthPage);
const DashboardPage = lazy(loadDashboardPage);
const HomeSection = lazy(loadHome);
const MarketSection = lazy(loadMarket);
const WalletSection = lazy(loadWallet);
const TradeSection = lazy(loadTrade);
const ProfileSection = lazy(loadProfile);
const HelpSection = lazy(loadHelp);

const AppShell = () => {
  if (!isFirebaseConfigured) return <SetupScreen />;
  return (
    <ToastProvider>
      <AuthProvider>
        <Suspense fallback={<Loader fullScreen />}>
          <Routes>
            <Route path="auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
              <Route index element={<HomeSection />} />
              <Route path="market" element={<MarketSection />} />
              <Route path="wallet" element={<WalletSection />} />
              <Route path="trade" element={<TradeSection />} />
              <Route path="profile" element={<ProfileSection />} />
              <Route path="help" element={<HelpSection />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ToastProvider>
  );
};

export default AppShell;
