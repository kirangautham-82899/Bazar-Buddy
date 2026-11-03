// POST /api/assistant  { messages: [{ role, content }], location?: { lat, lng, label } }
//   -> { reply }   (503 { error: 'not_configured' } until ANTHROPIC_API_KEY is set)
import Anthropic from '@anthropic-ai/sdk';
import { askAssistant } from './_lib/assistant.js';
import { readJson, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Use POST' });
    return;
  }
  const env = {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    googleKey: process.env.GOOGLE_PLACES_API_KEY,
    dataGovKey: process.env.DATA_GOV_IN_API_KEY,
  };
  if (!env.anthropicKey) {
    sendJson(res, 503, { error: 'not_configured' });
    return;
  }
  try {
    sendJson(res, 200, await askAssistant(await readJson(req), { env }));
  } catch (err) {
    if (err.status && !(err instanceof Anthropic.APIError)) {
      sendJson(res, err.status, { error: err.message });
    } else if (err instanceof Anthropic.AuthenticationError) {
      console.error('Assistant: invalid ANTHROPIC_API_KEY');
      sendJson(res, 503, { error: 'not_configured' });
    } else if (err instanceof Anthropic.RateLimitError) {
      sendJson(res, 429, { error: 'busy' });
    } else {
      console.error(err);
      sendJson(res, 502, { error: 'unavailable' });
    }
  }
}
