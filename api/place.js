// GET /api/place?q=560002 | ?q=Chickpet, Bengaluru | ?lat=12.96&lng=77.58
//   -> { lat, lng, label, district, state, precision: 'pin' | 'address' | 'gps' }
import { findPlace } from './_lib/place.js';
import { handle } from './_lib/http.js';

const ONE_DAY = 60 * 60 * 24;

export default handle((query) => findPlace(query), ONE_DAY);
