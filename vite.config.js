import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig({
  plugins: [react()],
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
  },
});
