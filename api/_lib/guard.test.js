// @vitest-environment node
import { assertSameOrigin, clientKey, createRateLimiter } from './guard.js';

const req = (headers) => ({ headers });

describe('assertSameOrigin', () => {
  it('allows our own pages and non-browser clients', () => {
    expect(() => assertSameOrigin(req({ origin: 'https://bazar-buddy-neon.vercel.app', host: 'bazar-buddy-neon.vercel.app' }))).not.toThrow();
    expect(() => assertSameOrigin(req({ host: 'bazar-buddy-neon.vercel.app' }))).not.toThrow();
  });

  it('refuses other sites', () => {
    expect(() => assertSameOrigin(req({ origin: 'https://evil.example', host: 'bazar-buddy-neon.vercel.app' }))).toThrow(expect.objectContaining({ status: 403 }));
    expect(() => assertSameOrigin(req({ origin: 'null', host: 'bazar-buddy-neon.vercel.app' }))).toThrow(expect.objectContaining({ status: 403 }));
  });
});

describe('rate limiting', () => {
  it('lets a visitor ask up to the limit, then again after the window', () => {
    let t = 0;
    const limit = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    limit('a');
    limit('a');
    expect(() => limit('a')).toThrow(expect.objectContaining({ status: 429 }));
    expect(() => limit('b')).not.toThrow(); // other visitors unaffected
    t = 1500;
    expect(() => limit('a')).not.toThrow();
  });

  it('keys visitors by the first forwarded address', () => {
    expect(clientKey(req({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
  });
});
