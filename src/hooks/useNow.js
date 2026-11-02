import { useEffect, useState } from 'react';

// Re-renders every `intervalMs` so time-based order progress stays current.
export const useNow = (intervalMs = 30000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};
