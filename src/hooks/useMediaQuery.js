import { useCallback, useSyncExternalStore } from 'react';

// Live match for a CSS media query; re-renders when the window crosses the breakpoint.
export const useMediaQuery = (queryText) => {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(queryText);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
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
