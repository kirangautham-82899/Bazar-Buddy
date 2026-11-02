// Today's wholesale prices from Agmarknet ("Current daily price of various
// commodities from various markets") on data.gov.in. Needs a free API key in
// DATA_GOV_IN_API_KEY; without it the endpoint reports `configured: false`.
const RESOURCE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Agmarknet prices are per quintal (100 kg); shoppers think per kg.
const perKg = (perQuintal) => (perQuintal === null ? null : Math.round((perQuintal / 100) * 10) / 10);

export const normalizeRecord = (r) => ({
  market: r.market,
  district: r.district,
  state: r.state,
  commodity: r.commodity,
  variety: r.variety,
  arrivalDate: r.arrival_date,
  minPerKg: perKg(toNumber(r.min_price)),
  maxPerKg: perKg(toNumber(r.max_price)),
  modalPerKg: perKg(toNumber(r.modal_price)),
});

const buildUrl = (apiKey, { state, district, commodity }, limit) => {
  const params = new URLSearchParams({ 'api-key': apiKey, format: 'json', limit: String(limit) });
  if (state) params.set('filters[state.keyword]', state);
  if (district) params.set('filters[district]', district);
  if (commodity) params.set('filters[commodity]', commodity);
  return `${RESOURCE}?${params}`;
};

// District first; if that district reported nothing today, widen to the state.
export const fetchMandiPrices = async ({ state, district, commodity }, { apiKey, fetchImpl = fetch, limit = 100 } = {}) => {
  if (!apiKey) return { configured: false, scope: null, records: [] };
  const scopes = district ? [['district', { state, district, commodity }], ['state', { state, commodity }]] : [['state', { state, commodity }]];
  for (const [scope, filters] of scopes) {
    const res = await fetchImpl(buildUrl(apiKey, filters, limit));
    if (!res.ok) throw new Error(`Agmarknet request failed (${res.status})`);
    const json = await res.json();
    const records = (json.records || []).map(normalizeRecord).filter((r) => r.modalPerKg !== null);
    if (records.length) return { configured: true, scope, records };
  }
  return { configured: true, scope: null, records: [] };
};
