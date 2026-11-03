// Turns what the user gives us (a PIN code, a typed address or GPS coordinates)
// into a precise point plus district and state, using OpenStreetMap's Nominatim
// geocoder. Nominatim asks for an identifying User-Agent and light use; our
// responses are cached at the edge for a day.
import { HttpError } from './http.js';
import { PIN_RE, lookupPincode } from './pincode.js';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
export const USER_AGENT = 'BazarBuddy/1.0 (https://bazar-buddy-neon.vercel.app)';

const COORD_RE = /^-?\d{1,3}(\.\d+)?$/;

const nominatim = async (path, params, fetchImpl) => {
  const query = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', 'accept-language': 'en', ...params });
  const res = await fetchImpl(`${NOMINATIM}/${path}?${query}`, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new HttpError(502, 'Location service is unavailable');
  return res.json();
};

// Short, readable name for a Nominatim result: "Chickpet, Bengaluru".
const labelOf = (address = {}) => {
  const local = address.neighbourhood || address.suburb || address.quarter || address.village || address.hamlet;
  const city = address.city || address.town || address.county || address.state_district;
  return [...new Set([local, city].filter(Boolean))].join(', ') || address.state || '';
};

const fromResult = (r) => ({
  lat: Number(r.lat),
  lng: Number(r.lon),
  label: labelOf(r.address),
  district: r.address?.state_district || r.address?.county || r.address?.city || '',
  state: r.address?.state || '',
});

const searchIndia = async (params, fetchImpl) => {
  const [first] = await nominatim('search', { countrycodes: 'in', limit: '1', ...params }, fetchImpl);
  return first ? fromResult(first) : null;
};

// PIN: India Post gives the official district and state; Nominatim gives the
// point (the PIN's own centre, or its first post office if the PIN isn't mapped).
// If India Post is down, Nominatim's own answer is used on its own.
const placeForPin = async (pin, fetchImpl) => {
  const [post, mapped] = await Promise.all([
    lookupPincode(pin, fetchImpl).catch((err) => (err.status === 404 ? Promise.reject(err) : null)),
    searchIndia({ postalcode: pin }, fetchImpl),
  ]);
  const point = mapped || (post && (await searchIndia({ q: `${post.places[0]}, ${post.district}, ${post.state}` }, fetchImpl)));
  if (!point) throw new HttpError(404, 'PIN code not found');
  if (!post) return { ...point, precision: 'pin' };
  return { lat: point.lat, lng: point.lng, label: `${post.places[0]}, ${post.district}`, district: post.district, state: post.state, precision: 'pin' };
};

export const findPlace = async ({ q, lat, lng } = {}, fetchImpl = fetch) => {
  if (lat !== undefined || lng !== undefined) {
    if (!COORD_RE.test(String(lat)) || !COORD_RE.test(String(lng))) throw new HttpError(400, 'Invalid coordinates');
    const r = await nominatim('reverse', { lat: String(lat), lon: String(lng), zoom: '16' }, fetchImpl);
    if (!r || r.error) throw new HttpError(404, 'Location not found');
    return { ...fromResult(r), lat: Number(lat), lng: Number(lng), precision: 'gps' };
  }
  const text = String(q || '').trim();
  if (PIN_RE.test(text)) return placeForPin(text, fetchImpl);
  if (text.length < 3) throw new HttpError(400, 'Enter a PIN code or an address');
  const found = await searchIndia({ q: text.slice(0, 200) }, fetchImpl);
  if (!found) throw new HttpError(404, 'Address not found');
  return { ...found, precision: 'address' };
};
