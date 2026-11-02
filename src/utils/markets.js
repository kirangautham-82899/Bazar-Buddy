// Ranking markets by closeness, either from GPS coordinates or from a place
// (state + district) looked up from a PIN code.

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

export const distanceKm = (a, b) => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

const same = (a = '', b = '') => a.trim().toLowerCase() === b.trim().toLowerCase();

// Within the nearby set (already cut to `limit` by closeness), markets known for
// the item move up. Ranking by item first would pull in far-away markets.
const itemFirst = (list, item) =>
  item ? list.map((m, i) => ({ m, i })).sort((a, b) => (a.m.tier ?? 0) - (b.m.tier ?? 0) || Number(isKnownFor(b.m, item)) - Number(isKnownFor(a.m, item)) || a.i - b.i).map(({ m }) => m) : list;

export const isKnownFor = (market, item) => market.known.some((k) => same(k, item));

// Nearest markets to a point. With an item, nearby markets known for it come first.
export const nearestMarkets = (point, markets, { limit = 12, item } = {}) =>
  itemFirst(
    markets
      .map((m) => ({ ...m, distanceKm: distanceKm(point, m) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit),
    item
  );

// Average position of the markets in a state, used when we only know the state.
const centreOf = (list) => ({
  lat: list.reduce((s, m) => s + m.lat, 0) / list.length,
  lng: list.reduce((s, m) => s + m.lng, 0) / list.length,
});

// Markets for a place from a PIN code: same district first, then the rest of the
// state, then the nearest markets in neighbouring states.
export const marketsForPlace = ({ state, district }, markets, { limit = 12, item } = {}) => {
  const inState = markets.filter((m) => same(m.state, state));
  const inDistrict = inState.filter((m) => same(m.district, district) || same(m.city, district));
  const anchor = inDistrict.length ? centreOf(inDistrict) : inState.length ? centreOf(inState) : null;
  if (!anchor) return { markets: [], matched: 'none' };
  const ranked = markets
    .map((m) => ({ ...m, distanceKm: distanceKm(anchor, m), tier: inDistrict.includes(m) ? 0 : same(m.state, state) ? 1 : 2 }))
    .sort((a, b) => a.tier - b.tier || a.distanceKm - b.distanceKm)
    .slice(0, limit);
  return { markets: itemFirst(ranked, item), matched: inDistrict.length ? 'district' : 'state' };
};

export const formatDistance = (km) => (km < 1 ? '< 1 km' : `${Math.round(km).toLocaleString('en-IN')} km`);

export const directionsUrl = (market) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${market.name}, ${market.city}, ${market.state}`)}`;
