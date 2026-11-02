import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import Loader from './components/common/Loader';
import LandingPage from './pages/landing/LandingPage';
import { loadAppShell } from './routes/lazy';

// The landing page ships in the entry bundle; everything else (including
// Firebase) arrives with the app shell chunk.
const AppShell = lazy(loadAppShell);

const App = () => (
  <MotionConfig reducedMotion="user">
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/*"
            element={
              <Suspense fallback={<Loader fullScreen />}>
                <AppShell />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </MotionConfig>
);

export default App;
