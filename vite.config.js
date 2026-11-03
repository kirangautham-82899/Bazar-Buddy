import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import placeHandler from './api/place.js';
import nearbyMarketsHandler from './api/nearby-markets.js';
import mandiPricesHandler from './api/mandi-prices.js';
import assistantHandler from './api/assistant.js';

// Serves the Vercel functions in /api during `npm run dev`, so the whole app
// (including local markets) works locally exactly as it does on Vercel.
const apiRoutes = (env) => ({
  name: 'bazar-buddy-api',
  configureServer(server) {
    process.env.DATA_GOV_IN_API_KEY ??= env.DATA_GOV_IN_API_KEY;
    process.env.GOOGLE_PLACES_API_KEY ??= env.GOOGLE_PLACES_API_KEY;
    process.env.ANTHROPIC_API_KEY ??= env.ANTHROPIC_API_KEY;
    server.middlewares.use('/api/place', (req, res) => placeHandler(req, res));
    server.middlewares.use('/api/nearby-markets', (req, res) => nearbyMarketsHandler(req, res));
    server.middlewares.use('/api/mandi-prices', (req, res) => mandiPricesHandler(req, res));
    server.middlewares.use('/api/assistant', (req, res) => assistantHandler(req, res));
  },
});

// Libraries split into long-lived chunks: an app deploy doesn't force
// visitors to re-download React, Firebase or the animation library.
const VENDOR_CHUNKS = {
  react: ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'],
  motion: ['framer-motion', 'motion-dom', 'motion-utils'],
  firebase: ['firebase', '@firebase'],
  map: ['leaflet', 'react-leaflet', '@react-leaflet'],
};

const vendorChunk = (id) => {
  if (!id.includes('node_modules')) return undefined;
  const pkg = id.split('node_modules/').pop().split('/').slice(0, id.includes('node_modules/@') ? 2 : 1).join('/');
  return Object.keys(VENDOR_CHUNKS).find((name) =>
    VENDOR_CHUNKS[name].some((dep) => pkg === dep || pkg.startsWith(`${dep}/`))
  );
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), apiRoutes(loadEnv(mode, process.cwd(), ''))],
  // Keep the existing REACT_APP_* variable names (also set on Vercel).
  envPrefix: ['VITE_', 'REACT_APP_'],
  server: { port: 3000, open: false },
  preview: { port: 4173 },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: { manualChunks: vendorChunk },
    },
  },
  // Pre-bundle the big icon module once so the dev server starts fast on later runs.
  optimizeDeps: {
    include: ['react-icons/fa', 'react-icons/gi', 'framer-motion', 'react-router-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    css: false,
    // App-level tests lazy-load screens; a cold first run can take several seconds.
    testTimeout: 15000,
  },
}));
