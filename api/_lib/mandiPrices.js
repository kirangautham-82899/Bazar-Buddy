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

// Agmarknet's own spellings for states whose usual names differ ("Keralam", not "Kerala").
const STATE_NAMES = {
  kerala: 'Keralam',
  delhi: 'NCT of Delhi',
  'national capital territory of delhi': 'NCT of Delhi',
  chhattisgarh: 'Chattisgarh',
  puducherry: 'Pondicherry',
  'andaman and nicobar islands': 'Andaman and Nicobar',
  orissa: 'Odisha',
  'jammu & kashmir': 'Jammu and Kashmir',
};

export const agmarknetState = (state = '') => STATE_NAMES[state.trim().toLowerCase()] || state.trim();

// District names are spelled differently too ("Palakad", "Thirssur", "Kozhikode(Calicut)"),
// so compare letters only, ignore anything in brackets, and allow a small typo.
const letters = (name = '') => name.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z]/g, '');

const editDistance = (a, b) => {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
};

export const sameDistrict = (a, b) => {
  const x = letters(a);
  const y = letters(b);
  if (!x || !y) return false;
  return x === y || editDistance(x, y) <= Math.min(2, Math.floor(Math.min(x.length, y.length) / 4));
};

const buildUrl = (apiKey, { state, commodity }, limit) => {
  const params = new URLSearchParams({ 'api-key': apiKey, format: 'json', limit: String(limit) });
  if (state) params.set('filters[state.keyword]', agmarknetState(state));
  if (commodity) params.set('filters[commodity]', commodity);
  return `${RESOURCE}?${params}`;
};

// data.gov.in sometimes stalls or drops a request (it then also omits the header that
// lets the browser read the reply), so each try has a time limit and a failed one is retried.
const getRecords = async (url, { fetchImpl, timeoutMs, retries }) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) return await res.json();
      if (res.status < 500 || attempt >= retries) throw new Error(`Agmarknet request failed (${res.status})`);
    } catch (err) {
      if (attempt >= retries || /request failed \(4/.test(err.message)) throw err;
    }
  }
};

// One request for the whole state, then the district's own markets if it reported
// today; otherwise every market in the state.
export const fetchMandiPrices = async (
  { state, district, commodity },
  { apiKey, fetchImpl = fetch, limit = 2000, timeoutMs = 15000, retries = 1 } = {}
) => {
  if (!apiKey) return { configured: false, scope: null, records: [] };
  const json = await getRecords(buildUrl(apiKey, { state, commodity }, limit), { fetchImpl, timeoutMs, retries });
  const records = (json.records || []).map(normalizeRecord).filter((r) => r.modalPerKg !== null);
  if (!records.length) return { configured: true, scope: null, records: [] };
  const local = district ? records.filter((r) => sameDistrict(r.district, district)) : [];
  return local.length ? { configured: true, scope: 'district', records: local } : { configured: true, scope: 'state', records };
};
