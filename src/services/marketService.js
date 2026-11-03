// Calls our own /api functions (see /api): places, nearby markets and live mandi prices.
const getJson = async (url) => {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return body;
};

// A PIN code or typed address, or coordinates -> { lat, lng, label, district, state, precision }.
// Naming the area needs only ~11 m, so GPS is rounded before it leaves the device;
// distances on the page still use the exact point.
export const findPlace = ({ q, lat, lng }) =>
  getJson(`/api/place?${new URLSearchParams(q !== undefined ? { q } : { lat: lat.toFixed(4), lng: lng.toFixed(4) })}`);

// Rounded to ~100 m so nearby users share the cached answer; distances are
// still measured from the exact point on the page.
export const fetchNearbyMarkets = ({ lat, lng }, radiusKm) =>
  getJson(`/api/nearby-markets?${new URLSearchParams({ lat: lat.toFixed(3), lng: lng.toFixed(3), radius: String(radiusKm) })}`);

export const fetchMandiPrices = ({ state, district, commodity }) => {
  const params = new URLSearchParams({ state });
  if (district) params.set('district', district);
  if (commodity) params.set('commodity', commodity);
  return getJson(`/api/mandi-prices?${params}`);
};

// A fresh, high-accuracy GPS fix (no cached position). Resolves
// { lat, lng, accuracy } with accuracy in metres; rejects 'denied' or 'unavailable'.
export const currentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject(new Error(err.code === 1 ? 'denied' : 'unavailable')),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });
