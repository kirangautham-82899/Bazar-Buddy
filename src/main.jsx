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

// The landing page is pre-rendered at build time: hydrate it there, render fresh elsewhere.
if (container.firstElementChild && window.location.pathname === '/') hydrateRoot(container, app);
else createRoot(container).render(app);
