// Tiny helpers shared by the Vercel functions and the Vite dev middleware.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const queryOf = (req) => req.query || Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);

export const sendJson = (res, status, body, cacheSeconds = 0) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (cacheSeconds) res.setHeader('Cache-Control', `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds}`);
  res.end(JSON.stringify(body));
};

// Wraps a handler body: its result is sent as JSON, a thrown HttpError as an error.
export const handle = (run, cacheSeconds) => async (req, res) => {
  try {
    sendJson(res, 200, await run(queryOf(req)), cacheSeconds);
  } catch (err) {
    if (!err.status) console.error(err);
    sendJson(res, err.status || 500, { error: err.status ? err.message : 'Something went wrong' });
  }
};
