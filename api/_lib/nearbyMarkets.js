// Real vegetable markets, mandis and greengrocers around a point: Google Places
// (see googlePlaces.js) or OpenStreetMap via the Overpass API, whose two public
// servers are tried in order.
import { HttpError } from './http.js';
import { fetchGooglePlaces } from './googlePlaces.js';
import { USER_AGENT } from './place.js';

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
export const MAX_RADIUS_KM = 20;
const MAX_RESULTS = 80;
const TIMEOUT_MS = 12000;

// Marketplaces that clearly aren't for food.
const NOT_FOOD = /furniture|electronic|mobile|medical|pharma|cloth|textile|garment|saree|jewel|gold|book|shoe|footwear|hardware|automobile|computer|cycle|timber|steel|plastic|cosmetic/i;

export const buildQuery = ({ lat, lng, radiusKm }) => {
  const around = `around:${Math.round(radiusKm * 1000)},${lat},${lng}`;
  return [
    '[out:json][timeout:20];(',
    `nwr(${around})["amenity"="marketplace"];`,
    `nwr(${around})["shop"="greengrocer"];`,
    `nwr(${around})["shop"="wholesale"]["wholesale"~"vegetable|fruit|food|grocer|agri",i];`,
    `);out center tags ${MAX_RESULTS * 2};`,
  ].join('');
};

const kindOf = (tags) => (tags.amenity === 'marketplace' ? 'market' : tags.shop === 'wholesale' ? 'wholesale' : 'greengrocer');

export const normalizeElement = (el) => {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat === undefined || lng === undefined) return null;
  const name = tags['name:en'] || tags.name || '';
  if (tags.amenity === 'marketplace' && NOT_FOOD.test(name)) return null;
  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    kind: kindOf(tags),
    lat,
    lng,
    area: [tags['addr:street'], tags['addr:suburb'] || tags['addr:neighbourhood'], tags['addr:city']].filter(Boolean).join(', '),
    hours: tags.opening_hours || '',
  };
};

const fetchOsm = async (point, radius, fetchImpl) => {
  const body = new URLSearchParams({ data: buildQuery({ ...point, radiusKm: radius }) }).toString();
  for (const url of OVERPASS) {
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        body,
        headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) continue;
      const { elements = [] } = await res.json();
      return elements.map(normalizeElement).filter(Boolean).slice(0, MAX_RESULTS);
    } catch {
      // Try the next server.
    }
  }
  throw new HttpError(502, 'Market map is unavailable');
};

// Google Places when a key is configured (falling back to OpenStreetMap if
// Google fails), OpenStreetMap otherwise.
export const fetchNearbyMarkets = async ({ lat, lng, radiusKm }, { googleKey, fetchImpl = fetch } = {}) => {
  const point = { lat: Number(lat), lng: Number(lng) };
  const radius = Number(radiusKm);
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180) {
    throw new HttpError(400, 'Invalid coordinates');
  }
  if (!(radius > 0 && radius <= MAX_RADIUS_KM)) throw new HttpError(400, `Radius must be up to ${MAX_RADIUS_KM} km`);
  if (googleKey) {
    try {
      return { source: 'google', markets: await fetchGooglePlaces({ ...point, radiusKm: radius }, { apiKey: googleKey, fetchImpl }) };
    } catch (err) {
      console.error(err);
    }
  }
  return { source: 'osm', markets: await fetchOsm(point, radius, fetchImpl) };
};
