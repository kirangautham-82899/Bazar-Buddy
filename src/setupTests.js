// Adds DOM matchers such as toBeInTheDocument() to Vitest's expect.
import '@testing-library/jest-dom/vitest';

// jsdom has no matchMedia. Tests run as a phone unless they set `window.__desktop = true`.
if (typeof window !== 'undefined') {
  window.matchMedia = (query) => ({
    matches: Boolean(window.__desktop) && /min-width/.test(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
}
