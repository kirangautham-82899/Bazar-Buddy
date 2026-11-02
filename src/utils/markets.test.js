import mandis from '../data/mandis';
import { distanceKm, marketsForPlace, nearestMarkets } from './markets';

const ALL_STATES_AND_UTS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

describe('mandi directory', () => {
  it('covers every state and union territory', () => {
    const states = new Set(mandis.map((m) => m.state));
    expect(ALL_STATES_AND_UTS.filter((s) => !states.has(s))).toEqual([]);
  });

  it('has unique ids and coordinates inside India', () => {
    expect(new Set(mandis.map((m) => m.id)).size).toBe(mandis.length);
    mandis.forEach((m) => {
      expect(m.lat).toBeGreaterThan(6);
      expect(m.lat).toBeLessThan(37);
      expect(m.lng).toBeGreaterThan(68);
      expect(m.lng).toBeLessThan(98);
    });
  });
});

describe('distanceKm', () => {
  it('is roughly right for Delhi to Mumbai', () => {
    const d = distanceKm({ lat: 28.6139, lng: 77.209 }, { lat: 19.076, lng: 72.8777 });
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1200);
  });
});

describe('nearestMarkets', () => {
  const nearKolar = { lat: 13.13, lng: 78.13 };

  it('orders markets by distance from a GPS point', () => {
    const [first, second] = nearestMarkets(nearKolar, mandis);
    expect(first.id).toBe('kolar');
    expect(second.distanceKm).toBeGreaterThanOrEqual(first.distanceKm);
  });

  it('keeps results nearby and lists those known for the item first', () => {
    const bengaluru = { lat: 12.97, lng: 77.59 };
    const plain = nearestMarkets(bengaluru, mandis, { limit: 6 });
    const tomato = nearestMarkets(bengaluru, mandis, { limit: 6, item: 'Tomato' });
    // Same nearby markets, only reordered.
    expect(tomato.map((m) => m.id).sort()).toEqual(plain.map((m) => m.id).sort());
    const known = tomato.map((m) => m.known.includes('Tomato'));
    expect(known).toEqual([...known].sort((a, b) => Number(b) - Number(a)));
    expect(known[0]).toBe(true);
  });
});

describe('marketsForPlace', () => {
  it('lists the same district first, then the rest of the state', () => {
    const { markets, matched } = marketsForPlace({ state: 'Delhi', district: 'North West Delhi' }, mandis);
    expect(matched).toBe('district');
    expect(markets[0].id).toBe('azadpur');
    expect(markets.slice(1, 3).every((m) => m.state === 'Delhi')).toBe(true);
  });

  it('falls back to the state when the district has no listed market', () => {
    const { markets, matched } = marketsForPlace({ state: 'Karnataka', district: 'Udupi' }, mandis);
    expect(matched).toBe('state');
    expect(markets[0].state).toBe('Karnataka');
  });

  it('returns nothing for an unknown state', () => {
    expect(marketsForPlace({ state: 'Atlantis', district: 'X' }, mandis).markets).toEqual([]);
  });
});
