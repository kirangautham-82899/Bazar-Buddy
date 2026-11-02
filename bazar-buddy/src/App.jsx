import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { isFirebaseConfigured } from './config/firebase';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/RouteGuards';
import Loader from './components/common/Loader';
import SetupScreen from './components/common/SetupScreen';
import LanguagePage from './pages/LanguagePage';
import AuthPage from './pages/AuthPage';

// Dashboard sections are split into their own chunks (maps and animations are heavy).
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HomeSection = lazy(() => import('./features/home/HomeSection'));
const MarketSection = lazy(() => import('./features/market/MarketSection'));
const WalletSection = lazy(() => import('./features/wallet/WalletSection'));
const TradeSection = lazy(() => import('./features/trade/TradeSection'));
const ProfileSection = lazy(() => import('./features/profile/ProfileSection'));
const HelpSection = lazy(() => import('./features/help/HelpSection'));

const AppRoutes = () => (
  <Suspense fallback={<Loader fullScreen />}>
    <Routes>
      <Route path="/" element={<PublicOnlyRoute><LanguagePage /></PublicOnlyRoute>} />
      <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
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
);

const App = () => (
  <MotionConfig reducedMotion="user">
    <LanguageProvider>
      {isFirebaseConfigured ? (
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      ) : (
        <SetupScreen />
      )}
    </LanguageProvider>
  </MotionConfig>
);

export default App;
