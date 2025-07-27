import React, { useState } from 'react';
import './TradeSection.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { doc, updateDoc, arrayUnion, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getPredictedPrice = (item) => {
  // Simulated AI price predictor (replace with actual model later)
  const defaultPrices = {
    Tomatoes: 30,
    Onions: 20,
    Potatoes: 25,
  };
  return defaultPrices[item] || 40;
};

const TradeSection = ({ language }) => {
  const [user] = useAuthState(auth);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [offer, setOffer] = useState('');
const [request, setRequest] = useState('');
const [barterList, setBarterList] = useState([]);


const vendorGroups = [
  {
    id: 'group1',
    name: 'Shyam Nagar Group',
    lat: 28.6139,
    lng: 77.2090,
    members: 5,
    offer: '10% off bulk veggies',
    ratings: [5, 4, 5],
    reviews: ['Fresh produce!', 'Great pricing'],
    stock: { Tomatoes: true, Onions: false, Potatoes: true },
    item: 'Tomatoes',
    price: 45,
    verified: true,
    fastDelivery: true,
  },
  {
    id: 'group2',
    name: 'Ravi Market Crew',
    lat: 28.6120,
    lng: 77.2150,
    members: 3,
    offer: 'Free delivery above ₹300',
    ratings: [4, 3],
    reviews: ['Decent service', 'Delivery delay'],
    stock: { Tomatoes: false, Onions: true, Potatoes: true },
    item: 'Onions',
    price: 25,
    verified: false,
    fastDelivery: true,
  },
  {
    id: 'group3',
    name: 'Laxmi Nagar Vendors',
    lat: 28.6190,
    lng: 77.2200,
    members: 8,
    offer: 'Combo pack discount',
    ratings: [5, 5, 4, 4],
    reviews: ['Awesome variety', 'Good service'],
    stock: { Tomatoes: true, Onions: true, Potatoes: true },
    item: 'Potatoes',
    price: 27,
    verified: true,
    fastDelivery: false,
  },
  {
    id: 'group4',
    name: 'Green Circle Co.',
    lat: 28.6170,
    lng: 77.2250,
    members: 6,
    offer: 'Free 1kg with 5kg',
    ratings: [3, 3, 4],
    reviews: ['Needs improvement', 'Fair enough'],
    stock: { Tomatoes: false, Onions: true, Potatoes: false },
    item: 'Onions',
    price: 22,
    verified: false,
    fastDelivery: true,
  },
  {
    id: 'group5',
    name: 'Vikaspuri Supply',
    lat: 28.6090,
    lng: 77.1980,
    members: 9,
    offer: '10% cashback with UPI',
    ratings: [5, 4, 5, 5],
    reviews: ['Reliable vendor', 'Always fresh'],
    stock: { Tomatoes: true, Onions: true, Potatoes: false },
    item: 'Tomatoes',
    price: 40,
    verified: true,
    fastDelivery: true,
  },
  {
    id: 'group6',
    name: 'Janpath Wholesale',
    lat: 28.6050,
    lng: 77.2100,
    members: 7,
    offer: 'Free onions with orders',
    ratings: [4, 3],
    reviews: ['Affordable', 'Sometimes late'],
    stock: { Tomatoes: true, Onions: true, Potatoes: true },
    item: 'Tomatoes',
    price: 35,
    verified: true,
    fastDelivery: false,
  },
  {
    id: 'group7',
    name: 'Urban Mandi',
    lat: 28.6115,
    lng: 77.2088,
    members: 12,
    offer: '₹50 off on bundles',
    ratings: [5, 5, 5],
    reviews: ['Super quick!', 'Best pricing'],
    stock: { Tomatoes: true, Onions: false, Potatoes: true },
    item: 'Potatoes',
    price: 28,
    verified: true,
    fastDelivery: true,
  },
  {
    id: 'group8',
    name: 'Chandni Chowk Connect',
    lat: 28.6560,
    lng: 77.2300,
    members: 15,
    offer: 'Free delivery all day',
    ratings: [3, 2],
    reviews: ['Overpriced', 'Needs better packaging'],
    stock: { Tomatoes: true, Onions: true, Potatoes: false },
    item: 'Onions',
    price: 32,
    verified: false,
    fastDelivery: true,
  },
  {
    id: 'group9',
    name: 'Model Town Sourcing',
    lat: 28.7030,
    lng: 77.1880,
    members: 10,
    offer: '₹100 off above ₹500',
    ratings: [4, 5],
    reviews: ['Clean packaging', 'Reliable'],
    stock: { Tomatoes: false, Onions: false, Potatoes: true },
    item: 'Potatoes',
    price: 30,
    verified: true,
    fastDelivery: false,
  },
  {
    id: 'group10',
    name: 'Noida Fresh Farmers',
    lat: 28.5355,
    lng: 77.3910,
    members: 20,
    offer: 'Farm-direct delivery',
    ratings: [5, 4, 4],
    reviews: ['Super fresh!', 'Farm to table'],
    stock: { Tomatoes: true, Onions: true, Potatoes: true },
    item: 'Tomatoes',
    price: 38,
    verified: true,
    fastDelivery: true,
  },
  // Add more entries as needed — Here are IDs 11 to 27 (just copy the above structure with new names and coords)
  {
    id: 'group11',
    name: 'Dwarka Cart Crew',
    lat: 28.5921,
    lng: 77.0460,
    members: 7,
    offer: 'Flat ₹20 off',
    ratings: [3, 4],
    reviews: ['Okay service', 'Affordable'],
    stock: { Tomatoes: false, Onions: true, Potatoes: true },
    item: 'Onions',
    price: 23,
    verified: false,
    fastDelivery: true,
  },
  {
    id: 'group12',
    name: 'Narela Market Team',
    lat: 28.8440,
    lng: 77.0910,
    members: 4,
    offer: 'Late night delivery',
    ratings: [4, 4],
    reviews: ['Convenient', 'Not always fresh'],
    stock: { Tomatoes: true, Onions: true, Potatoes: false },
    item: 'Tomatoes',
    price: 39,
    verified: false,
    fastDelivery: true,
  },
  {
    id: 'group13',
    name: 'Palam Agro Line',
    lat: 28.5860,
    lng: 77.0710,
    members: 5,
    offer: 'Combo packs available',
    ratings: [4, 4, 5],
    reviews: ['Love combos!', 'Repeat buyer'],
    stock: { Tomatoes: true, Onions: true, Potatoes: true },
    item: 'Potatoes',
    price: 29,
    verified: true,
    fastDelivery: true,
  },
  {
    id: 'group14',
    name: 'Okhla Vendor Net',
    lat: 28.5245,
    lng: 77.2771,
    members: 6,
    offer: 'Fresh every day',
    ratings: [5],
    reviews: ['Always early delivery'],
    stock: { Tomatoes: true, Onions: false, Potatoes: true },
    item: 'Tomatoes',
    price: 42,
    verified: true,
    fastDelivery: true,
  },
  {
    id: 'group15',
    name: 'Sarojini Cooperative',
    lat: 28.5743,
    lng: 77.1990,
    members: 11,
    offer: 'Bulk only',
    ratings: [4, 4],
    reviews: ['Good for shop owners'],
    stock: { Tomatoes: false, Onions: true, Potatoes: true },
    item: 'Onions',
    price: 20,
    verified: false,
    fastDelivery: false,
  },
  
];

  

  const submitFeedback = async () => {
    if (!selectedGroup || !user) return;
    const groupRef = doc(db, 'vendorGroups', selectedGroup.id);
    await updateDoc(groupRef, {
      ratings: arrayUnion(rating),
      reviews: arrayUnion(reviewText),
    });
    setReviewText('');
    alert('✅ Feedback submitted!');
  };

  const requestJoin = async (groupId) => {
    if (!user) return alert('Please login to join');
    await addDoc(collection(db, 'vendorGroups', groupId, 'requests'), {
      user: user.displayName || 'Guest',
      uid: user.uid,
      timestamp: new Date(),
    });
    alert('✅ Join request sent!');
  };

  return (
    <motion.div
      className="trade-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>{language === 'hi' ? 'लाइव विक्रेता नक्शा' : 'Live Vendor Map'}</h2>

      <div className="map-container">
        <MapContainer center={[28.6139, 77.2090]} zoom={13} scrollWheelZoom={false} style={{ height: '450px', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {vendorGroups.map((group) => (
            <Marker key={group.id} position={[group.lat, group.lng]}>
              <Popup>
                <h3>{group.name}</h3>

                <div className="badges">
                  {group.verified && <span className="badge verified">✔️ Verified</span>}
                  {group.fastDelivery && <span className="badge">⚡ Fast Delivery</span>}
                </div>

                <p>{language === 'hi' ? `सदस्य: ${group.members}` : `Members: ${group.members}`}</p>
                <p>{language === 'hi' ? `ऑफ़र: ${group.offer}` : `Offer: ${group.offer}`}</p>

                <p>
                  ⭐ {group.ratings?.length
                    ? (group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length).toFixed(1)
                    : 'No Ratings'}
                </p>

                {group.reviews?.slice(0, 2).map((r, i) => (
                  <p key={i}>💬 {r}</p>
                ))}

                <h4>{language === 'hi' ? 'स्टॉक स्थिति' : 'Stock Availability'}</h4>
                <ul>
                  {Object.entries(group.stock || {}).map(([item, available]) => (
                    <li key={item}>
                      {item}: {available ? '✅' : '❌'}
                    </li>
                  ))}
                </ul>

                {group.price > getPredictedPrice(group.item) + 10 && (
                  <p className="ai-warning">⚠️ {language === 'hi' ? 'मूल्य अधिक है!' : 'High Price Detected!'}</p>
                )}

                <button className="join-button" onClick={() => requestJoin(group.id)}>
                  {language === 'hi' ? 'समूह से जुड़ें' : 'Join Group'}
                </button>

                <button className="feedback-btn" onClick={() => setSelectedGroup(group)}>
                  {language === 'hi' ? 'रेट और प्रतिक्रिया दें' : 'Rate & Feedback'}
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {/* 🔁 Live Barter System Section */}
<motion.div
  className="barter-section"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <h3 style={{ marginBottom: '12px' }}>
    🔁 {language === 'hi' ? 'बार्टर सिस्टम' : 'Live Barter Exchange'}
  </h3>

  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (!offer || !request) return;
      setBarterList(prev => [...prev, { offer, request }]);
      setOffer('');
      setRequest('');
    }}
    className="barter-form"
  >
    <input
      type="text"
      placeholder={language === 'hi' ? 'आप क्या देना चाहते हैं?' : 'Offer Item'}
      value={offer}
      onChange={(e) => setOffer(e.target.value)}
      required
    />
    <input
      type="text"
      placeholder={language === 'hi' ? 'आप बदले में क्या चाहते हैं?' : 'Request Item'}
      value={request}
      onChange={(e) => setRequest(e.target.value)}
      required
    />
    <button type="submit">
      📩 {language === 'hi' ? 'बार्टर अनुरोध करें' : 'Send Barter Request'}
    </button>
  </form>

  <div className="barter-list">
    {barterList.length === 0 ? (
      <p>{language === 'hi' ? 'कोई बार्टर ऑफर नहीं' : 'No barter offers yet.'}</p>
    ) : (
      barterList.map((entry, index) => (
        <motion.div
          key={index}
          className="barter-entry"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          📦 <strong>{entry.offer}</strong> ↔ 🎯 <strong>{entry.request}</strong>
        </motion.div>
      ))
    )}
  </div>
</motion.div>
        {/* 🔁 Live Barter System Section End */}

        {selectedGroup && (
          <div className="feedback-box">
            <h4>{language === 'hi' ? 'अपनी रेटिंग दें' : 'Give Your Rating'}</h4>
            <select onChange={(e) => setRating(Number(e.target.value))}>
              <option value="5">⭐⭐⭐⭐⭐</option>
              <option value="4">⭐⭐⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
              <option value="2">⭐⭐</option>
              <option value="1">⭐</option>
            </select>
            <input
              placeholder={language === 'hi' ? 'अपनी प्रतिक्रिया लिखें...' : 'Write your review...'}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button onClick={submitFeedback}>
              {language === 'hi' ? 'सबमिट करें' : 'Submit'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
    
  );
};

export default TradeSection;
