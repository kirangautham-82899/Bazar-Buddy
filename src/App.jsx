import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Loader from './components/common/Loader';
import LandingPage from './pages/landing/LandingPage';
import { loadAppShell } from './routes/lazy';

// The landing page ships in the entry bundle; everything else (including
// Firebase) arrives with the app shell chunk. The router is supplied by the
// caller: BrowserRouter in the browser, StaticRouter when pre-rendering.
const AppShell = lazy(loadAppShell);

const App = () => (
  <MotionConfig reducedMotion="user">
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
  </MotionConfig>
);

export default App;
