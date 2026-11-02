// Build-time renderer: turns the landing page into static HTML so search
// engines and slow phones see the full content before any JavaScript runs.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { buildStructuredData } from './seo/structuredData';

export const render = (url) =>
  renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );

export { buildStructuredData };
