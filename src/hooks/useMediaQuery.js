import { useCallback, useSyncExternalStore } from 'react';

// Live match for a CSS media query; re-renders when the window crosses the breakpoint.
export const useMediaQuery = (queryText) => {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(queryText);
      list.addEventListener('change', onChange);
      // Some browsers and device emulators skip the media-query change event on
      // resize, so the plain resize event is the backstop (React ignores no-op updates).
      window.addEventListener('resize', onChange);
      return () => {
        list.removeEventListener('change', onChange);
        window.removeEventListener('resize', onChange);
      };
    },
    [queryText]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(queryText).matches,
    () => false
  );
};

// Desktop gets its own layout (top bar, no bottom nav) from this width up.
export const DESKTOP_QUERY = '(min-width: 1024px)';

export const useIsDesktop = () => useMediaQuery(DESKTOP_QUERY);

const subscribeResize = (onChange) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

// How many product columns fit across a full-width desktop page: the window minus
// the side gutters (clamp(24px, 3.5vw, 64px)), at least 176 px a column, 20 px gaps.
export const desktopColumns = (width) => {
  const gutter = Math.min(64, Math.max(24, width * 0.035));
  return Math.max(4, Math.min(10, Math.floor((width - 2 * gutter + 20) / (176 + 20))));
};

export const useDesktopColumns = () =>
  useSyncExternalStore(subscribeResize, () => desktopColumns(window.innerWidth), () => 6);
