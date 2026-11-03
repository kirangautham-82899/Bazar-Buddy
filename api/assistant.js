// POST /api/assistant  { messages: [{ role, content }], location?: { lat, lng, label } }
//   -> { reply }   (503 { error: 'not_configured' } until ANTHROPIC_API_KEY is set)
import Anthropic from '@anthropic-ai/sdk';
import { askAssistant } from './_lib/assistant.js';
import { assertSameOrigin, clientKey, createRateLimiter } from './_lib/guard.js';
import { readJson, sendJson } from './_lib/http.js';

// Fair use per visitor: 20 questions per 10 minutes.
const limitVisitor = createRateLimiter({ limit: 20, windowMs: 10 * 60 * 1000 });

export default async function handler(req, res) {
  // Conversations are private: never stored by browsers or the CDN.
  res.setHeader('Cache-Control', 'no-store');
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
  try {
    assertSameOrigin(req);
    if (!env.anthropicKey) {
      sendJson(res, 503, { error: 'not_configured' });
      return;
    }
    limitVisitor(clientKey(req));
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
      // Status only: conversation text and locations are never logged.
      console.error(`Assistant failed: ${err.name}${err.status ? ` ${err.status}` : ''}`);
      sendJson(res, 502, { error: 'unavailable' });
    }
  }
}
