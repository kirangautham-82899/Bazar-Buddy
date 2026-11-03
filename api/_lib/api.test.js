// @vitest-environment node
import { lookupPincode } from './pincode.js';
import { fetchMandiPrices, normalizeRecord } from './mandiPrices.js';
import { findPlace } from './place.js';
import { buildQuery, fetchNearbyMarkets, normalizeElement } from './nearbyMarkets.js';
import { normalizePlace } from './googlePlaces.js';

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

  const greengrocer = { type: 'node', id: 9, lat: 12.96, lon: 77.58, tags: { shop: 'greengrocer' } };
  const OPTS = { nominatimGapMs: 0 };

  it('falls back to the second Overpass server', async () => {
    const fetchImpl = vi.fn(async (url) => {
      if (url.includes('overpass-api.de')) return jsonResponse({}, false, 504);
      if (url.includes('overpass')) return jsonResponse({ elements: [greengrocer] });
      return jsonResponse([]);
    });
    const { source, markets } = await fetchNearbyMarkets({ lat: '12.96', lng: '77.58', radiusKm: '5' }, { fetchImpl, ...OPTS });
    expect(source).toBe('osm');
    expect(markets).toHaveLength(1);
  });

  it('still finds markets through Nominatim when Overpass is down, merged without duplicates', async () => {
    const valiyaAngadi = { osm_type: 'node', osm_id: 1, category: 'amenity', type: 'marketplace', name: 'Valiya Angadi', lat: '10.7736', lon: '76.6453', address: { road: 'Market Road', city: 'Palakkad' } };
    const fishMarket = { osm_type: 'node', osm_id: 2, category: 'amenity', type: 'marketplace', name: 'Fish Market', lat: '10.77', lon: '76.65' };
    const veg = { osm_type: 'node', osm_id: 3, category: 'shop', type: 'greengrocer', name: 'Vegetable Store', lat: '10.72', lon: '76.67' };
    const fetchImpl = vi.fn(async (url) => {
      if (url.includes('overpass')) throw new TypeError('fetch failed');
      const { searchParams } = new URL(url);
      expect(searchParams.get('bounded')).toBe('1');
      return jsonResponse(searchParams.get('q') === 'marketplace' ? [valiyaAngadi, fishMarket] : [veg, veg]);
    });
    const { markets } = await fetchNearbyMarkets({ lat: 10.78, lng: 76.65, radiusKm: 10 }, { fetchImpl, ...OPTS });
    expect(markets.map((m) => m.name)).toEqual(['Valiya Angadi', 'Vegetable Store']);
    expect(markets[0]).toMatchObject({ id: 'osm-node-1', kind: 'market', lat: 10.7736, area: 'Market Road, Palakkad' });
  });

  it('reports the map as unavailable only when every source fails', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, false, 503));
    await expect(fetchNearbyMarkets({ lat: 12.96, lng: 77.58, radiusKm: 5 }, { fetchImpl, ...OPTS })).rejects.toMatchObject({ status: 502 });
  });

  it('refuses radii beyond the nearby limit', async () => {
    await expect(fetchNearbyMarkets({ lat: 12.96, lng: 77.58, radiusKm: 500 }, { fetchImpl: vi.fn() })).rejects.toMatchObject({ status: 400 });
  });
});

describe('Google Places', () => {
  const place = (id, primaryType, latitude = 12.964) => ({
    id,
    displayName: { text: `Place ${id}` },
    location: { latitude, longitude: 77.581 },
    shortFormattedAddress: 'Avenue Road, Bengaluru',
    primaryType,
  });

  it('searches by type and by text around the point, with the key in a header', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ places: [place('a', 'market'), place('b', 'grocery_store')] }))
      .mockResolvedValueOnce(jsonResponse({ places: [place('a', 'market'), place('c', 'market')] }));
    const { source, markets } = await fetchNearbyMarkets({ lat: 12.96, lng: 77.58, radiusKm: 2 }, { googleKey: 'test-key', fetchImpl });
    expect(source).toBe('google');
    expect(markets.map((m) => m.id).sort()).toEqual(['g-a', 'g-b', 'g-c']); // duplicates merged
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://places.googleapis.com/v1/places:searchNearby');
    expect(url).not.toContain('test-key');
    expect(init.headers['X-Goog-Api-Key']).toBe('test-key');
    expect(JSON.parse(init.body).locationRestriction.circle).toEqual({ center: { latitude: 12.96, longitude: 77.58 }, radius: 2000 });
    expect(fetchImpl.mock.calls[1][0]).toBe('https://places.googleapis.com/v1/places:searchText');
  });

  it('falls back to OpenStreetMap when Google fails', async () => {
    const fetchImpl = vi.fn(async (url) =>
      url.includes('googleapis') ? jsonResponse({}, false, 403) : url.includes('overpass') ? jsonResponse({ elements: [{ type: 'node', id: 1, lat: 12.96, lon: 77.58, tags: { shop: 'greengrocer' } }] }) : jsonResponse([])
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(fetchNearbyMarkets({ lat: 12.96, lng: 77.58, radiusKm: 2 }, { googleKey: 'k', fetchImpl, nominatimGapMs: 0 })).resolves.toMatchObject({ source: 'osm' });
  });

  it('maps place types and skips closed places', () => {
    expect(normalizePlace(place('x', 'grocery_store'))).toMatchObject({ id: 'g-x', placeId: 'x', kind: 'grocery', area: 'Avenue Road, Bengaluru' });
    expect(normalizePlace(place('y', 'market'))).toMatchObject({ kind: 'market' });
    expect(normalizePlace({ ...place('z', 'market'), businessStatus: 'CLOSED_PERMANENTLY' })).toBeNull();
  });
});
