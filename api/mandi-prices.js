// GET /api/mandi-prices?state=Delhi&district=North+Delhi&commodity=Tomato
//   -> { configured, scope: 'district' | 'state' | null, records: [...] }
import { fetchMandiPrices } from './_lib/mandiPrices.js';
import { queryOf, sendJson } from './_lib/http.js';

const THIRTY_MINUTES = 60 * 30;

export default async function handler(req, res) {
  const { state, district, commodity } = queryOf(req);
  if (!state) {
    sendJson(res, 400, { error: 'state is required' });
    return;
  }
  try {
    const result = await fetchMandiPrices({ state, district, commodity }, { apiKey: process.env.DATA_GOV_IN_API_KEY });
    sendJson(res, 200, result, result.configured ? THIRTY_MINUTES : 0);
  } catch (err) {
    console.error(err);
    sendJson(res, 502, { error: 'Price service is unavailable' });
  }
}
