// PIN code -> district and state, via India Post's public API. Called from our
// server because that API doesn't allow browser (CORS) requests.
import { HttpError } from './http.js';

export const PIN_RE = /^[1-9]\d{5}$/;

export const lookupPincode = async (pin, fetchImpl = fetch) => {
  if (!PIN_RE.test(String(pin || ''))) throw new HttpError(400, 'Enter a valid 6-digit PIN code');
  const res = await fetchImpl(`https://api.postalpincode.in/pincode/${pin}`);
  if (!res.ok) throw new HttpError(502, 'PIN code service is unavailable');
  const [result] = await res.json();
  const offices = result?.Status === 'Success' ? result.PostOffice || [] : [];
  if (!offices.length) throw new HttpError(404, 'PIN code not found');
  return {
    pin: String(pin),
    district: offices[0].District,
    state: offices[0].State,
    places: [...new Set(offices.map((o) => o.Name))].slice(0, 10),
  };
};
