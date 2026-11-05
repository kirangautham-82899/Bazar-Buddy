// Prices come straight from data.gov.in when a browser key is set (it refuses
// cloud servers like Vercel), and from our own /api otherwise.
const jsonResponse = (body) => ({ ok: true, status: 200, json: async () => body });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('fetchMandiPrices', () => {
  it('asks data.gov.in from the browser when a browser key is set', async () => {
    vi.stubEnv('REACT_APP_DATA_GOV_IN_API_KEY', 'browser-key');
    const fetch = vi.fn(async () =>
      jsonResponse({ records: [{ market: 'Palakkad', district: 'Palakkad', state: 'Kerala', commodity: 'Tomato', modal_price: '2500' }] })
    );
    vi.stubGlobal('fetch', fetch);
    const { fetchMandiPrices } = await import('./marketService');

    const result = await fetchMandiPrices({ state: 'Kerala', district: 'Palakkad', commodity: 'Tomato' });

    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.origin).toBe('https://api.data.gov.in');
    expect(url.searchParams.get('api-key')).toBe('browser-key');
    expect(url.searchParams.get('filters[district]')).toBe('Palakkad');
    expect(result).toMatchObject({ configured: true, scope: 'district', records: [{ market: 'Palakkad', modalPerKg: 25 }] });
  });

  it('uses our own server without a browser key', async () => {
    vi.stubEnv('REACT_APP_DATA_GOV_IN_API_KEY', '');
    const fetch = vi.fn(async () => jsonResponse({ configured: false, scope: null, records: [] }));
    vi.stubGlobal('fetch', fetch);
    const { fetchMandiPrices } = await import('./marketService');

    await fetchMandiPrices({ state: 'Kerala' });

    expect(fetch.mock.calls[0][0]).toBe('/api/mandi-prices?state=Kerala');
  });
});
