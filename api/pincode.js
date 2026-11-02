// GET /api/pincode?pin=110006 -> { pin, district, state, places }
import { lookupPincode } from './_lib/pincode.js';
import { queryOf, sendJson } from './_lib/http.js';

const ONE_DAY = 60 * 60 * 24;

export default async function handler(req, res) {
  try {
    sendJson(res, 200, await lookupPincode(queryOf(req).pin), ONE_DAY);
  } catch (err) {
    sendJson(res, err.status || 500, { error: err.status ? err.message : 'Something went wrong' });
  }
}
