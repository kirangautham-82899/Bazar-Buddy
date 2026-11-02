// @vitest-environment node
import { lookupPincode } from './pincode.js';
import { fetchMandiPrices, normalizeRecord } from './mandiPrices.js';

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
