// POST /api/assistant  { messages: [{ role, content }], location?: { lat, lng, label } }
//   -> { reply }   (503 { error: 'not_configured' } until GEMINI_API_KEY is set)
import { GeminiError, askAssistant } from './_lib/assistant.js';
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
    geminiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL,
    googleKey: process.env.GOOGLE_PLACES_API_KEY,
    dataGovKey: process.env.DATA_GOV_IN_API_KEY,
  };
  try {
    assertSameOrigin(req);
    if (!env.geminiKey) {
      sendJson(res, 503, { error: 'not_configured' });
      return;
    }
    limitVisitor(clientKey(req));
    sendJson(res, 200, await askAssistant(await readJson(req), { env }));
  } catch (err) {
    if (err.status && !(err instanceof GeminiError)) {
      sendJson(res, err.status, { error: err.message });
    } else if (err instanceof GeminiError && err.badKey) {
      console.error('Assistant: GEMINI_API_KEY was rejected');
      sendJson(res, 503, { error: 'not_configured' });
    } else if (err instanceof GeminiError && err.status === 429) {
      sendJson(res, 429, { error: 'busy' });
    } else {
      // Status only: conversation text and locations are never logged.
      console.error(`Assistant failed: ${err.name}${err.status ? ` ${err.status}` : ''}`);
      sendJson(res, 502, { error: 'unavailable' });
    }
  }
}
