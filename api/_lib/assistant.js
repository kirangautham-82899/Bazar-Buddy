// Bazar Buddy's chat assistant: Claude with tools over our own data (places,
// nearby markets with timings, mandi prices). Tools only read public data, so
// whatever the chat asks, the worst a tool call can do is look something up.
import Anthropic from '@anthropic-ai/sdk';
import { betaTool } from '@anthropic-ai/sdk/helpers/beta/json-schema';
import mandis from '../../src/data/mandis.js';
import { directionsUrl, formatDistance, marketsWithin } from '../../src/utils/markets.js';
import { formatTime, openStatus } from '../../src/utils/openingHours.js';
import { HttpError } from './http.js';
import { findPlace } from './place.js';
import { MAX_RADIUS_KM, fetchNearbyMarkets } from './nearbyMarkets.js';
import { fetchMandiPrices } from './mandiPrices.js';

const MODEL = 'claude-opus-5-5';
const MAX_TURNS = 16;
const MAX_MESSAGE_CHARS = 2000;
const MAX_MARKETS = 15;

// Kept identical across requests so it is served from the prompt cache.
const SYSTEM = `You are Bazar Buddy's assistant. Bazar Buddy is a wholesale vegetable and grocery app for street vendors across India: they order stock for delivery, and they also buy at local mandis and markets.

Help them find where to go and the quickest way to get things done: nearby markets and what they sell, which are open now, directions, today's mandi prices, and shortcuts inside the app.

How to answer:
- Short and practical, in simple English. Most vendors read on a phone between customers: lead with the answer, then at most a few bullet points.
- Never invent markets, distances, timings, phone numbers or prices. Use the tools. When a tool says a timing or price is not listed, say so plainly and suggest calling ahead or checking on the Markets page.
- To find markets you need a point. Use the shopper's shared location when one is given; otherwise ask for their PIN code or area and look it up with find_place. Start with a 5 km radius and widen only if nothing is found.
- When you mention a market, give its distance, whether it is open now (or when it opens), and its directions link as a markdown link: [Directions](url).
- Prices from Agmarknet are wholesale mandi prices per kg reported by the government; they are not Bazar Buddy's own prices.
- For anything about ordering, link to the app page instead of explaining at length.

App shortcuts (use exactly these paths as markdown links):
- Shop home: /shop
- Categories: /shop/category/vegetables, /shop/category/fruits, /shop/category/grains, /shop/category/spices, /shop/category/dairy, /shop/category/oil, /shop/category/combo
- Search products: /shop/search?q=tomato
- Local markets near a PIN or area: /markets?q=560002 (add &item=Tomato to focus on one produce, &open=1 for open now, &km=10 for distance)
- Cart and checkout: /cart
- My orders and tracking: /orders
- Account, saved address, help: /account

Only help with Bazar Buddy, shopping, markets, produce and running a small food stall. Politely decline anything else.`;

// The shopper's clock: Indian Standard Time, whatever the server's zone.
export const indiaNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

const statusText = (schedule, now) => {
  const s = openStatus(schedule, now);
  if (!s) return schedule ? 'closed all week' : 'timings not listed';
  if (s.open) return s.allDay ? 'open 24 hours' : `open now, closes ${formatTime(s.until)}`;
  const when = s.day === 0 ? 'today' : s.day === 1 ? 'tomorrow' : s.weekday;
  return `closed now, opens ${when} ${formatTime(s.opensAt)}`;
};

const DIRECTORY = mandis.map((m) => ({ ...m, kind: 'mandi', precise: false }));

export const nearbyForAssistant = async ({ lat, lng, radius_km: radiusKm = 5, open_now_only: openOnly = false }, { googleKey, fetchImpl, now = indiaNow() } = {}) => {
  const radius = Math.min(Math.max(Number(radiusKm) || 5, 1), MAX_RADIUS_KM);
  const point = { lat: Number(lat), lng: Number(lng) };
  let mapped = [];
  let note = '';
  try {
    mapped = (await fetchNearbyMarkets({ ...point, radiusKm: radius }, { googleKey, fetchImpl })).markets.map((m) => ({ ...m, precise: true }));
  } catch {
    note = 'The local market map is unavailable right now; only major mandis are listed.';
  }
  let found = marketsWithin(point, [...mapped, ...DIRECTORY], radius);
  if (openOnly) found = found.filter((m) => openStatus(m.schedule, now)?.open);
  return {
    radius_km: radius,
    count: found.length,
    note,
    markets: found.slice(0, MAX_MARKETS).map((m) => ({
      name: m.name || (m.kind === 'greengrocer' ? 'Vegetable shop (no name listed)' : 'Market (no name listed)'),
      kind: m.kind,
      distance: `${m.precise ? '' : 'about '}${formatDistance(m.distanceKm)}`,
      area: m.area || (m.city ? `${m.city}, ${m.state}` : ''),
      status: statusText(m.schedule, now),
      hours: m.hours || '',
      phone: m.phone || '',
      known_for: m.known || [],
      directions: directionsUrl(m),
    })),
  };
};

const asJson = (value) => JSON.stringify(value);

// Each tool returns JSON text; failures come back as text the model can explain.
const guarded = (run) => async (input) => {
  try {
    return asJson(await run(input));
  } catch (err) {
    return asJson({ error: err.status ? err.message : 'This lookup failed. Please try again.' });
  }
};

export const buildTools = (env, deps = {}) => [
  betaTool({
    name: 'find_place',
    description: 'Look up an Indian PIN code or a typed area/address (e.g. "678001" or "Chickpet, Bengaluru") and get its exact coordinates, district and state.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'A 6-digit PIN code, or an area and city.' } },
      required: ['query'],
      additionalProperties: false,
    },
    run: guarded(({ query }) => findPlace({ q: query }, deps.fetchImpl)),
  }),
  betaTool({
    name: 'find_nearby_markets',
    description:
      'List vegetable markets, mandis, greengrocers and grocery stores within a radius of a point, nearest first, with distance, open/closed status for the current time in India, weekly hours, phone and a directions link.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' },
        radius_km: { type: 'number', description: `Search radius in km, 1 to ${MAX_RADIUS_KM}. Start with 5.` },
        open_now_only: { type: 'boolean', description: 'Only markets known to be open right now.' },
      },
      required: ['lat', 'lng'],
      additionalProperties: false,
    },
    run: guarded((input) => nearbyForAssistant(input, { googleKey: env.googleKey, fetchImpl: deps.fetchImpl })),
  }),
  betaTool({
    name: 'get_mandi_prices',
    description: "Today's wholesale prices (₹ per kg) reported to Agmarknet by mandis in a district (falls back to the whole state), optionally for one commodity.",
    inputSchema: {
      type: 'object',
      properties: {
        state: { type: 'string', description: 'Indian state, e.g. "Kerala".' },
        district: { type: 'string', description: 'District, e.g. "Palakkad".' },
        commodity: { type: 'string', description: 'Agmarknet commodity name, e.g. "Tomato", "Onion", "Ginger(Green)".' },
      },
      required: ['state'],
      additionalProperties: false,
    },
    run: guarded(async (input) => {
      const result = await fetchMandiPrices(input, { apiKey: env.dataGovKey, fetchImpl: deps.fetchImpl, limit: 30 });
      return result.configured ? result : { note: 'Live mandi prices are not connected yet.' };
    }),
  }),
];

// Plain text turns from the chat window, checked and trimmed.
export const cleanHistory = (messages) => {
  if (!Array.isArray(messages) || !messages.length) throw new HttpError(400, 'Send at least one message');
  const turns = messages.slice(-MAX_TURNS).map((m) => ({
    role: m?.role === 'assistant' ? 'assistant' : 'user',
    content: String(m?.content ?? '').trim().slice(0, MAX_MESSAGE_CHARS),
  }));
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns.at(-1).role !== 'user' || !turns.at(-1).content) throw new HttpError(400, 'The last message must be yours');
  return turns.filter((m) => m.content);
};

// Volatile context goes in a trailing system message, after the cached prefix.
// The location is rounded to ~110 m: enough to find nearby markets, not a doorstep.
const contextNote = (location, now) => {
  const time = now.toLocaleString('en-IN', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true });
  const where =
    location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))
      ? `The shopper shared their location: lat ${Number(location.lat).toFixed(3)}, lng ${Number(location.lng).toFixed(3)}${location.label ? ` (${String(location.label).slice(0, 80)})` : ''}.`
      : 'The shopper has not shared a location.';
  return `Current time in India: ${time}. ${where}`;
};

export const replyText = (message) => {
  if (message.stop_reason === 'refusal') return "Sorry, I can't help with that. Ask me about markets, prices or your orders.";
  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
};

export const askAssistant = async ({ messages, location }, { env, client = new Anthropic({ apiKey: env.anthropicKey }), deps } = {}) => {
  const history = cleanHistory(messages);
  const final = await client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 4000,
    max_iterations: 6,
    // Chat: quick, short answers. Thinking stays on (it can't be turned off on this model).
    output_config: { effort: 'low' },
    // If the model declines a request on policy grounds, the server retries on its default fallback.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    cache_control: { type: 'ephemeral' },
    system: SYSTEM,
    tools: buildTools(env, deps),
    messages: [...history, { role: 'system', content: contextNote(location, indiaNow()) }],
  });
  return { reply: replyText(final) || 'Sorry, I could not find an answer. Please try asking another way.' };
};
