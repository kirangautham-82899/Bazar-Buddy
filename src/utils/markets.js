// Distances and ranking for markets around the user's exact point.

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

export const distanceKm = (a, b) => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

const same = (a = '', b = '') => a.trim().toLowerCase() === b.trim().toLowerCase();

export const isKnownFor = (market, item) => (market.known || []).some((k) => same(k, item));

// Markets within `radiusKm` of the point, nearest first. Nothing further away.
export const marketsWithin = (point, markets, radiusKm) =>
  markets
    .map((m) => ({ ...m, distanceKm: distanceKm(point, m) }))
    .filter((m) => m.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

// Shown to the nearest 10 m close by, then to 0.1 km, then whole km.
export const formatDistance = (km) => {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString('en-IN')} km`;
};

// Mapped places go straight to their coordinates; directory mandis (city-level
// positions) are searched by name so Maps finds the actual yard.
export const directionsUrl = (market) =>
  market.precise
    ? `https://www.google.com/maps/dir/?api=1&destination=${market.lat},${market.lng}${market.placeId ? `&destination_place_id=${encodeURIComponent(market.placeId)}` : ''}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${market.name}, ${market.city}, ${market.state}`)}`;
