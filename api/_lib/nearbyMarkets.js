// Real vegetable markets, wholesale markets and greengrocers around a point: Google Places
// (see googlePlaces.js) when a key is set, otherwise OpenStreetMap data from two
// services at once, merged: Overpass (complete, but its public servers are often
// overloaded) and Nominatim (fewer results, but dependable).
import { HttpError } from './http.js';
import { fetchGooglePlaces } from './googlePlaces.js';
import { USER_AGENT, nominatim } from './place.js';
import { parseOsmHours } from './openingHours.js';

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
export const MAX_RADIUS_KM = 20;
const MAX_RESULTS = 80;
const OVERPASS_TIMEOUT_MS = 8000;
// Nominatim allows one request a second.
const NOMINATIM_GAP_MS = 1100;
const NOMINATIM_PHRASES = ['marketplace', 'greengrocer'];

// Marketplaces that aren't for vegetables and groceries.
const NOT_PRODUCE =
  /furniture|electronic|mobile|medical|pharma|cloth|textile|garment|saree|jewel|gold|book|shoe|footwear|hardware|automobile|computer|cycle|timber|steel|plastic|cosmetic|fish|meat|mutton|chicken|poultry|livestock|cattle/i;

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

// Timings and phone from OpenStreetMap tags.
const hoursAndPhone = (tags) => ({
  hours: tags.opening_hours || '',
  schedule: parseOsmHours(tags.opening_hours),
  phone: (tags.phone || tags['contact:phone'] || tags['contact:mobile'] || '').split(';')[0].trim(),
});

const isProduce = (kind, name) => kind !== 'market' || !NOT_PRODUCE.test(name);

export const normalizeElement = (el) => {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat === undefined || lng === undefined) return null;
  const name = tags['name:en'] || tags.name || '';
  const kind = kindOf(tags);
  if (!isProduce(kind, name)) return null;
  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    kind,
    lat,
    lng,
    area: [tags['addr:street'], tags['addr:suburb'] || tags['addr:neighbourhood'], tags['addr:city']].filter(Boolean).join(', '),
    ...hoursAndPhone(tags),
  };
};

// Same shape from a Nominatim search result.
export const normalizeNominatim = (r) => {
  const kind = r.category === 'amenity' && r.type === 'marketplace' ? 'market' : r.category === 'shop' && r.type === 'greengrocer' ? 'greengrocer' : null;
  if (!kind || !isProduce(kind, r.name || '')) return null;
  const a = r.address || {};
  return {
    id: `osm-${r.osm_type}-${r.osm_id}`,
    name: r.name || '',
    kind,
    lat: Number(r.lat),
    lng: Number(r.lon),
    area: [a.road, a.neighbourhood || a.suburb || a.village, a.city || a.town].filter(Boolean).join(', '),
    ...hoursAndPhone(r.extratags || {}),
  };
};

const fetchOverpass = async (point, radius, fetchImpl) => {
  const body = new URLSearchParams({ data: buildQuery({ ...point, radiusKm: radius }) }).toString();
  for (const url of OVERPASS) {
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        body,
        headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
      });
      if (!res.ok) continue;
      const { elements = [] } = await res.json();
      return elements.map(normalizeElement).filter(Boolean);
    } catch {
      // Try the next server.
    }
  }
  throw new HttpError(502, 'Market map is unavailable');
};

// A square box around the circle; the page trims results to the exact radius.
const viewbox = ({ lat, lng }, radius) => {
  const dLat = radius / 111.32;
  const dLng = radius / (111.32 * Math.cos((lat * Math.PI) / 180));
  return [lng - dLng, lat + dLat, lng + dLng, lat - dLat].map((n) => n.toFixed(5)).join(',');
};

const fetchNominatim = async (point, radius, fetchImpl, gapMs) => {
  const box = viewbox(point, radius);
  const found = [];
  for (const [i, phrase] of NOMINATIM_PHRASES.entries()) {
    if (i && gapMs) await new Promise((resolve) => setTimeout(resolve, gapMs));
    const results = await nominatim('search', { q: phrase, viewbox: box, bounded: '1', limit: '40', extratags: '1' }, fetchImpl);
    found.push(...results.map(normalizeNominatim).filter(Boolean));
  }
  return found;
};

const fetchOsm = async (point, radius, fetchImpl, gapMs) => {
  const results = await Promise.allSettled([fetchOverpass(point, radius, fetchImpl), fetchNominatim(point, radius, fetchImpl, gapMs)]);
  if (results.every((r) => r.status === 'rejected')) throw new HttpError(502, 'Market map is unavailable');
  const seen = new Set();
  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((m) => !seen.has(m.id) && seen.add(m.id))
    .slice(0, MAX_RESULTS);
};

// Google Places when a key is configured (falling back to OpenStreetMap if
// Google fails), OpenStreetMap otherwise.
export const fetchNearbyMarkets = async ({ lat, lng, radiusKm }, { googleKey, fetchImpl = fetch, nominatimGapMs = NOMINATIM_GAP_MS } = {}) => {
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
  return { source: 'osm', markets: await fetchOsm(point, radius, fetchImpl, nominatimGapMs) };
};
