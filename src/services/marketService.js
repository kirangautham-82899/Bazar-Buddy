// Calls our own /api functions (see /api): PIN code lookup and live mandi prices.
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

export const lookupPincode = (pin) => getJson(`/api/pincode?pin=${encodeURIComponent(pin)}`);

export const fetchMandiPrices = ({ state, district, commodity }) => {
  const params = new URLSearchParams({ state });
  if (district) params.set('district', district);
  if (commodity) params.set('commodity', commodity);
  return getJson(`/api/mandi-prices?${params}`);
};

// Browser GPS, wrapped in a promise. Rejects with 'denied' or 'unavailable'.
export const currentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.code === 1 ? 'denied' : 'unavailable')),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  });
