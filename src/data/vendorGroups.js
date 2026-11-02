// Nearby vendor groups around Delhi NCR. `prices` are per kg and feed the
// fair-price check; reviews and join requests are stored in Firestore.
const vendorGroups = [
  { id: 'group1', name: 'Shyam Nagar Group', area: 'Shyam Nagar', lat: 28.6139, lng: 77.209, members: 5, offer: '10% off bulk veggies', verified: true, fastDelivery: true, prices: { tomato: 45, onion: 26, potato: 22 }, stock: { tomato: true, onion: false, potato: true } },
  { id: 'group2', name: 'Ravi Market Crew', area: 'Connaught Place', lat: 28.612, lng: 77.215, members: 3, offer: 'Free delivery above ₹300', verified: false, fastDelivery: true, prices: { tomato: 31, onion: 25, potato: 21 }, stock: { tomato: false, onion: true, potato: true } },
  { id: 'group3', name: 'Laxmi Nagar Vendors', area: 'Laxmi Nagar', lat: 28.619, lng: 77.22, members: 8, offer: 'Combo pack discount', verified: true, fastDelivery: false, prices: { tomato: 30, onion: 24, potato: 27 }, stock: { tomato: true, onion: true, potato: true } },
  { id: 'group4', name: 'Green Circle Co.', area: 'ITO', lat: 28.617, lng: 77.225, members: 6, offer: 'Free 1 kg with 5 kg', verified: false, fastDelivery: true, prices: { tomato: 33, onion: 22, potato: 23 }, stock: { tomato: false, onion: true, potato: false } },
  { id: 'group5', name: 'Vikaspuri Supply', area: 'Vikaspuri', lat: 28.609, lng: 77.198, members: 9, offer: '10% cashback with UPI', verified: true, fastDelivery: true, prices: { tomato: 40, onion: 25, potato: 22 }, stock: { tomato: true, onion: true, potato: false } },
  { id: 'group6', name: 'Janpath Wholesale', area: 'Janpath', lat: 28.605, lng: 77.21, members: 7, offer: 'Free onions with orders', verified: true, fastDelivery: false, prices: { tomato: 35, onion: 23, potato: 24 }, stock: { tomato: true, onion: true, potato: true } },
  { id: 'group7', name: 'Urban Mandi', area: 'Mandi House', lat: 28.6115, lng: 77.2088, members: 12, offer: '₹50 off on bundles', verified: true, fastDelivery: true, prices: { tomato: 29, onion: 27, potato: 28 }, stock: { tomato: true, onion: false, potato: true } },
  { id: 'group8', name: 'Chandni Chowk Connect', area: 'Chandni Chowk', lat: 28.656, lng: 77.23, members: 15, offer: 'Free delivery all day', verified: false, fastDelivery: true, prices: { tomato: 34, onion: 32, potato: 25 }, stock: { tomato: true, onion: true, potato: false } },
  { id: 'group9', name: 'Model Town Sourcing', area: 'Model Town', lat: 28.703, lng: 77.188, members: 10, offer: '₹100 off above ₹500', verified: true, fastDelivery: false, prices: { tomato: 32, onion: 24, potato: 30 }, stock: { tomato: false, onion: false, potato: true } },
  { id: 'group10', name: 'Noida Fresh Farmers', area: 'Noida', lat: 28.5355, lng: 77.391, members: 20, offer: 'Farm-direct delivery', verified: true, fastDelivery: true, prices: { tomato: 38, onion: 24, potato: 21 }, stock: { tomato: true, onion: true, potato: true } },
  { id: 'group11', name: 'Dwarka Cart Crew', area: 'Dwarka', lat: 28.5921, lng: 77.046, members: 7, offer: 'Flat ₹20 off', verified: false, fastDelivery: true, prices: { tomato: 31, onion: 23, potato: 22 }, stock: { tomato: false, onion: true, potato: true } },
  { id: 'group12', name: 'Narela Market Team', area: 'Narela', lat: 28.844, lng: 77.091, members: 4, offer: 'Late night delivery', verified: false, fastDelivery: true, prices: { tomato: 39, onion: 26, potato: 23 }, stock: { tomato: true, onion: true, potato: false } },
  { id: 'group13', name: 'Palam Agro Line', area: 'Palam', lat: 28.586, lng: 77.071, members: 5, offer: 'Combo packs available', verified: true, fastDelivery: true, prices: { tomato: 30, onion: 25, potato: 29 }, stock: { tomato: true, onion: true, potato: true } },
  { id: 'group14', name: 'Okhla Vendor Net', area: 'Okhla', lat: 28.5245, lng: 77.2771, members: 6, offer: 'Fresh every day', verified: true, fastDelivery: true, prices: { tomato: 42, onion: 24, potato: 22 }, stock: { tomato: true, onion: false, potato: true } },
  { id: 'group15', name: 'Sarojini Cooperative', area: 'Sarojini Nagar', lat: 28.5743, lng: 77.199, members: 11, offer: 'Bulk only', verified: false, fastDelivery: false, prices: { tomato: 30, onion: 20, potato: 23 }, stock: { tomato: false, onion: true, potato: true } },
];

// Unique market areas, in list order (used for the landing page's local SEO section).
export const servedAreas = [...new Set(vendorGroups.map((g) => g.area))];

export default vendorGroups;
