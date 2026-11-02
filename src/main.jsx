import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import App from './App';

const container = document.getElementById('root');
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

const storedLanguage = (() => {
  try {
    return window.localStorage.getItem('bazarBuddy.language');
  } catch {
    return null;
  }
})();

// The landing page is pre-rendered in English at build time. Hydrate it when the
// visitor will see that same markup; otherwise (Hindi, or any other route) render fresh.
const canHydrate = container.firstElementChild && window.location.pathname === '/' && storedLanguage !== 'hi';

if (canHydrate) hydrateRoot(container, app);
else createRoot(container).render(app);
