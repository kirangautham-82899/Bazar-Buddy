// Vegetable markets, wholesale markets and grocery stores around a point from Google
// Places (New). Two searches, merged: markets and grocery stores by type, and
// "vegetable market" by text, both ranked by distance. Opening hours and phone
// numbers are Enterprise-tier fields, so these calls bill at that rate.
import { HttpError } from './http.js';
import { fromGooglePeriods } from './openingHours.js';

const PLACES = 'https://places.googleapis.com/v1/places';
const FIELDS = ['places.id', 'places.displayName', 'places.location', 'places.shortFormattedAddress', 'places.primaryType', 'places.businessStatus', 'places.regularOpeningHours', 'places.internationalPhoneNumber'].join(',');
const TIMEOUT_MS = 8000;
const PAGE = 20;

const kindOf = (type = '') => (type === 'grocery_store' || type === 'supermarket' || type === 'food_store' ? 'grocery' : 'market');

export const normalizePlace = (p) => {
  if (!p?.location || p.businessStatus === 'CLOSED_PERMANENTLY') return null;
  return {
    id: `g-${p.id}`,
    placeId: p.id,
    name: p.displayName?.text || '',
    kind: kindOf(p.primaryType),
    lat: p.location.latitude,
    lng: p.location.longitude,
    area: p.shortFormattedAddress || '',
    hours: (p.regularOpeningHours?.weekdayDescriptions || []).join('; '),
    schedule: fromGooglePeriods(p.regularOpeningHours?.periods),
    phone: p.internationalPhoneNumber || '',
  };
};

const post = async (path, body, apiKey, fetchImpl) => {
  const res = await fetchImpl(`${PLACES}:${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELDS },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new HttpError(502, `Google Places request failed (${res.status})`);
  const { places = [] } = await res.json();
  return places;
};

export const fetchGooglePlaces = async ({ lat, lng, radiusKm }, { apiKey, fetchImpl = fetch }) => {
  const circle = { center: { latitude: lat, longitude: lng }, radius: radiusKm * 1000 };
  const [byType, byText] = await Promise.all([
    post('searchNearby', { includedTypes: ['market', 'grocery_store'], maxResultCount: PAGE, rankPreference: 'DISTANCE', locationRestriction: { circle } }, apiKey, fetchImpl),
    post('searchText', { textQuery: 'vegetable market', pageSize: PAGE, rankPreference: 'DISTANCE', regionCode: 'in', locationBias: { circle } }, apiKey, fetchImpl),
  ]);
  const seen = new Set();
  return [...byText, ...byType]
    .map(normalizePlace)
    .filter((p) => p && !seen.has(p.id) && seen.add(p.id));
};
