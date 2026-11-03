// Abuse protection for functions that cost money per call (the assistant):
// only our own pages may call them, and each visitor gets a fair-use budget.
import { HttpError } from './http.js';

const header = (req, name) => {
  const value = req.headers?.[name];
  return Array.isArray(value) ? value[0] : value || '';
};

// Browsers always send Origin on POST; a different site (or a page framing us) is refused.
export const assertSameOrigin = (req) => {
  const origin = header(req, 'origin');
  const host = header(req, 'x-forwarded-host') || header(req, 'host');
  if (!origin) return; // non-browser clients still face the rate limit
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, 'Forbidden');
  }
  if (originHost !== host) throw new HttpError(403, 'Forbidden');
};

export const clientKey = (req) => header(req, 'x-forwarded-for').split(',')[0].trim() || header(req, 'x-real-ip') || req.socket?.remoteAddress || 'unknown';

// Sliding window per visitor, kept in memory only (per server instance, never logged).
export const createRateLimiter = ({ limit, windowMs, now = () => Date.now() }) => {
  const hits = new Map();
  return (key) => {
    const t = now();
    const recent = (hits.get(key) || []).filter((at) => t - at < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      throw new HttpError(429, 'busy');
    }
    recent.push(t);
    hits.set(key, recent);
    if (hits.size > 10000) hits.delete(hits.keys().next().value); // bound memory
  };
};
