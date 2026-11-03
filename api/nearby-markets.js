// GET /api/nearby-markets?lat=12.962&lng=77.580&radius=5 -> { markets: [{ id, name, kind, lat, lng, area, hours }] }
import { fetchNearbyMarkets } from './_lib/nearbyMarkets.js';
import { handle } from './_lib/http.js';

const ONE_DAY = 60 * 60 * 24;

export default handle(({ lat, lng, radius }) => fetchNearbyMarkets({ lat, lng, radiusKm: radius }), ONE_DAY);
