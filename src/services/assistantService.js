// Calls our /api/assistant function (Gemini with market and price tools).
export const askAssistant = async ({ messages, location }) => {
  const res = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, location }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || 'Request failed');
    err.code = body.error;
    err.status = res.status;
    throw err;
  }
  return body;
};
