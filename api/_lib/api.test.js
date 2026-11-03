// @vitest-environment node
import { lookupPincode } from './pincode.js';
import { fetchMandiPrices, normalizeRecord } from './mandiPrices.js';
import { findPlace } from './place.js';
import { buildQuery, fetchNearbyMarkets, normalizeElement } from './nearbyMarkets.js';

const jsonResponse = (body, ok = true, status = 200) => ({ ok, status, json: async () => body });

describe('lookupPincode', () => {
  it('returns district and state from India Post', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([{ Status: 'Success', PostOffice: [{ Name: 'Azadpur', District: 'North West Delhi', State: 'Delhi' }] }])
    );
    await expect(lookupPincode('110033', fetchImpl)).resolves.toEqual({
      pin: '110033',
      district: 'North West Delhi',
      state: 'Delhi',
      places: ['Azadpur'],
    });
    expect(fetchImpl).toHaveBeenCalledWith('https://api.postalpincode.in/pincode/110033');
  });

  it('rejects malformed PIN codes without calling out', async () => {
    const fetchImpl = vi.fn();
    await expect(lookupPincode('12ab', fetchImpl)).rejects.toMatchObject({ status: 400 });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reports unknown PIN codes as 404', async () => {
    const fetchImpl = async () => jsonResponse([{ Status: 'Error', PostOffice: null }]);
    await expect(lookupPincode('999999', fetchImpl)).rejects.toMatchObject({ status: 404 });
  });
});

describe('fetchMandiPrices', () => {
  const record = { market: 'Azadpur', district: 'North West Delhi', state: 'Delhi', commodity: 'Tomato', variety: 'Hybrid', arrival_date: '02/11/2026', min_price: '1200', max_price: '2500', modal_price: '1800' };

  it('converts per-quintal prices to per kg', () => {
    expect(normalizeRecord(record)).toMatchObject({ market: 'Azadpur', minPerKg: 12, maxPerKg: 25, modalPerKg: 18 });
  });

  it('says it is not configured without an API key', async () => {
    const fetchImpl = vi.fn();
    await expect(fetchMandiPrices({ state: 'Delhi' }, { apiKey: '', fetchImpl })).resolves.toEqual({ configured: false, scope: null, records: [] });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('widens from district to state when the district has no reports', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ records: [] }))
      .mockResolvedValueOnce(jsonResponse({ records: [record] }));
    const result = await fetchMandiPrices({ state: 'Delhi', district: 'Central Delhi', commodity: 'Tomato' }, { apiKey: 'k', fetchImpl });
    expect(result.scope).toBe('state');
    expect(result.records).toHaveLength(1);
    const [first, second] = fetchImpl.mock.calls.map(([url]) => new URL(url).searchParams);
    expect(first.get('filters[district]')).toBe('Central Delhi');
    expect(second.has('filters[district]')).toBe(false);
    expect(second.get('filters[commodity]')).toBe('Tomato');
  });
});

describe('findPlace', () => {
  const hit = { lat: '12.9627285', lon: '77.5806486', address: { suburb: 'Chickpet', city: 'Bengaluru', state_district: 'Bengaluru Urban', state: 'Karnataka' } };

  it('pins a PIN code to its point, with India Post district and state', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ Status: 'Success', PostOffice: [{ Name: 'Bangalore City', District: 'Bangalore', State: 'Karnataka' }] }]))
      .mockResolvedValueOnce(jsonResponse([hit]));
    await expect(findPlace({ q: '560002' }, fetchImpl)).resolves.toEqual({
      lat: 12.9627285,
      lng: 77.5806486,
      label: 'Bangalore City, Bangalore',
      district: 'Bangalore',
      state: 'Karnataka',
      precision: 'pin',
    });
    const [url, init] = fetchImpl.mock.calls[1];
    const { pathname, searchParams } = new URL(url);
    expect(pathname).toBe('/search');
    expect(searchParams.get('postalcode')).toBe('560002');
    expect(searchParams.get('countrycodes')).toBe('in');
    expect(init.headers['User-Agent']).toMatch(/BazarBuddy/);
  });

  it('still finds a PIN code when India Post is down', async () => {
    const fetchImpl = vi.fn(async (url) => (url.includes('postalpincode') ? Promise.reject(new TypeError('fetch failed')) : jsonResponse([hit])));
    await expect(findPlace({ q: '560002' }, fetchImpl)).resolves.toMatchObject({ lat: 12.9627285, label: 'Chickpet, Bengaluru', state: 'Karnataka', precision: 'pin' });
  });

  it('geocodes a typed address', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([hit]));
    await expect(findPlace({ q: 'Chickpet, Bengaluru' }, fetchImpl)).resolves.toMatchObject({ label: 'Chickpet, Bengaluru', state: 'Karnataka', precision: 'address' });
  });

  it('names GPS coordinates but keeps the exact point', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(hit));
    await expect(findPlace({ lat: '12.971601', lng: '77.594602' }, fetchImpl)).resolves.toMatchObject({ lat: 12.971601, lng: 77.594602, label: 'Chickpet, Bengaluru', precision: 'gps' });
    expect(new URL(fetchImpl.mock.calls[0][0]).pathname).toBe('/reverse');
  });

  it('rejects bad input without calling out', async () => {
    const fetchImpl = vi.fn();
    await expect(findPlace({ q: 'a' }, fetchImpl)).rejects.toMatchObject({ status: 400 });
    await expect(findPlace({ lat: 'x', lng: '1' }, fetchImpl)).rejects.toMatchObject({ status: 400 });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reports unknown places as 404', async () => {
    await expect(findPlace({ q: 'Nowhere at all' }, async () => jsonResponse([]))).rejects.toMatchObject({ status: 404 });
  });
});

describe('fetchNearbyMarkets', () => {
  it('searches only around the point, in metres', () => {
    const query = buildQuery({ lat: 12.96, lng: 77.58, radiusKm: 2 });
    expect(query).toContain('around:2000,12.96,77.58');
    expect(query).toContain('"shop"="greengrocer"');
    expect(query).toContain('"amenity"="marketplace"');
  });

  it('keeps food places and drops other marketplaces', () => {
    expect(normalizeElement({ type: 'node', id: 1, lat: 1, lon: 2, tags: { shop: 'greengrocer', name: 'HOPCOMS', opening_hours: 'Mo-Su 07:00-21:00' } })).toEqual({
      id: 'osm-node-1',
      name: 'HOPCOMS',
      kind: 'greengrocer',
      lat: 1,
      lng: 2,
      area: '',
      hours: 'Mo-Su 07:00-21:00',
    });
    expect(normalizeElement({ type: 'way', id: 2, center: { lat: 1, lon: 2 }, tags: { amenity: 'marketplace', name: 'Russell Market' } })).toMatchObject({ kind: 'market', lat: 1 });
    expect(normalizeElement({ type: 'node', id: 3, lat: 1, lon: 2, tags: { amenity: 'marketplace', name: 'Infantry Road Furniture Market' } })).toBeNull();
  });

  it('falls back to the second server', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, false, 504))
      .mockResolvedValueOnce(jsonResponse({ elements: [{ type: 'node', id: 9, lat: 12.96, lon: 77.58, tags: { shop: 'greengrocer' } }] }));
    const { markets } = await fetchNearbyMarkets({ lat: '12.96', lng: '77.58', radiusKm: '5' }, fetchImpl);
    expect(markets).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('refuses radii beyond the nearby limit', async () => {
    await expect(fetchNearbyMarkets({ lat: 12.96, lng: 77.58, radiusKm: 500 }, vi.fn())).rejects.toMatchObject({ status: 400 });
  });
});
