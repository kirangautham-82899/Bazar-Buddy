import { useEffect } from 'react';

// Sets the tab title and, for private screens, asks search engines not to index
// them. Restores the landing page's values when the screen unmounts.
export const useDocumentMeta = ({ title, noindex = false }) => {
  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.querySelector('meta[name="robots"]');
    const previousRobots = robots?.getAttribute('content');
    if (title) document.title = title;
    if (noindex && robots) robots.setAttribute('content', 'noindex, nofollow');
    return () => {
      document.title = previousTitle;
      if (robots && previousRobots) robots.setAttribute('content', previousRobots);
    };
  }, [title, noindex]);
};
