import mandis from '../data/mandis';
import { directionsUrl, distanceKm, formatDistance, marketsWithin } from './markets';

const ALL_STATES_AND_UTS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

describe('built-in wholesale market list', () => {
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

describe('marketsWithin', () => {
  const bengaluru = { lat: 12.9627, lng: 77.5806 };

  it('keeps only markets inside the radius, nearest first', () => {
    const shops = [
      { id: 'far', lat: 13.1, lng: 77.58 }, // ~15 km north
      { id: 'near', lat: 12.965, lng: 77.581 }, // ~250 m
      { id: 'mid', lat: 12.99, lng: 77.58 }, // ~3 km
    ];
    expect(marketsWithin(bengaluru, shops, 5).map((m) => m.id)).toEqual(['near', 'mid']);
    expect(marketsWithin(bengaluru, shops, 1).map((m) => m.id)).toEqual(['near']);
  });

  it('never pulls in markets from other cities', () => {
    const found = marketsWithin(bengaluru, mandis, 20);
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((m) => m.state === 'Karnataka' && m.distanceKm <= 20)).toBe(true);
  });
});

describe('formatDistance', () => {
  it('is precise close by', () => {
    expect(formatDistance(0.004)).toBe('10 m');
    expect(formatDistance(0.347)).toBe('350 m');
    expect(formatDistance(2.345)).toBe('2.3 km');
    expect(formatDistance(14.6)).toBe('15 km');
  });
});

describe('directionsUrl', () => {
  it('routes to exact coordinates for mapped places', () => {
    expect(directionsUrl({ precise: true, lat: 12.96, lng: 77.58 })).toBe('https://www.google.com/maps/dir/?api=1&destination=12.96,77.58');
  });

  it('uses the Google place when known', () => {
    expect(directionsUrl({ precise: true, lat: 1, lng: 2, placeId: 'ChIJ1' })).toBe('https://www.google.com/maps/dir/?api=1&destination=1,2&destination_place_id=ChIJ1');
  });

  it('searches built-in markets by name', () => {
    const url = new URL(directionsUrl({ name: 'K.R. Market', city: 'Bengaluru', state: 'Karnataka' }));
    expect(url.searchParams.get('query')).toBe('K.R. Market, Bengaluru, Karnataka');
  });
});
