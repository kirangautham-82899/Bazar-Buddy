// src/components/HomeSection.jsx
import React, { useEffect, useState } from 'react';
import './HomeSection.css';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

import coinsAnim from '../assets/coin.json';
import reorderAnim from '../assets/reorder.json';
import offerAnim from '../assets/offer.json';

const HomeSection = ({ language }) => {
  const isHindi = language === 'hi';

  const initialPurchases = [
    { id: 1, item_en: 'Tomatoes', item_hi: 'टमाटर', price: '₹30/kg' },
    { id: 2, item_en: 'Onions', item_hi: 'प्याज', price: '₹25/kg' },
  ];

  const offerPool = [
    { id: 1, combo: 'Tomato + Onion', discount: '10% Off' },
    { id: 2, combo: 'Potato + Carrot', discount: '15% Off' },
    { id: 3, combo: 'Chillies + Garlic', discount: '5% Off' },
  ];

  const [pastPurchases] = useState(initialPurchases);
  const [offers, setOffers] = useState([offerPool[0]]);
  const [coins, setCoins] = useState(40);
  const [activeOrders, setActiveOrders] = useState([]);

  // 🌀 Simulate real-time updates
  useEffect(() => {
  const offerPool = [
    { id: 1, combo: 'Tomato + Onion', discount: '10% Off' },
    { id: 2, combo: 'Potato + Carrot', discount: '15% Off' },
    { id: 3, combo: 'Chillies + Garlic', discount: '5% Off' },
  ];

  const coinInterval = setInterval(() => {
    setCoins((prev) => Math.min(prev + 2, 100));
  }, 4000);

  const offerInterval = setInterval(() => {
    const randomOffer = offerPool[Math.floor(Math.random() * offerPool.length)];
    setOffers([randomOffer]);
  }, 6000);

  const orderInterval = setInterval(() => {
    const newOrder = {
      id: Date.now(),
      item: ['Tomatoes', 'Carrots', 'Onions'][Math.floor(Math.random() * 3)],
      status: ['Out for Delivery', 'Vendor Assigned', 'Packed'][Math.floor(Math.random() * 3)],
    };
    setActiveOrders((prev) => [newOrder, ...prev.slice(0, 2)]);
  }, 7000);

  return () => {
    clearInterval(coinInterval);
    clearInterval(offerInterval);
    clearInterval(orderInterval);
  };
}, []);



  const handleReorder = (item) => {
    alert(`✅ ${isHindi ? 'फिर से ऑर्डर किया गया' : 'Reordered'}: ${isHindi ? item.item_hi : item.item_en}`);
  };

  const handleComboOrder = () => {
    alert('💳 Redirecting to Payment...');
  };

  const handleRedeemCoins = () => {
    if (coins >= 50) {
      alert('🎉 Coins Redeemed!');
      setCoins(coins - 50);
    }
  };

  return (
    <motion.div className="home-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Left Column */}
      <div className="home-column left-column">
        {/* 🛒 Quick Reorder */}
        <motion.div className="home-card pastel1" whileHover={{ scale: 1.03 }}>
          <Lottie animationData={reorderAnim} className="lottie-icon" />
          <h3>{isHindi ? 'पुनः ऑर्डर करें' : 'Quick Reorder'}</h3>
          <ul>
            {pastPurchases.map((item) => (
              <li key={item.id}>
                🧺 {isHindi ? item.item_hi : item.item_en} - {item.price}
                <button className="small-btn" onClick={() => handleReorder(item)}>
                  {isHindi ? 'ऑर्डर' : 'Reorder'}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 💰 Apna Coins */}
        <motion.div className="home-card pastel3" whileHover={{ scale: 1.03 }}>
          <Lottie animationData={coinsAnim} className="lottie-icon" />
          <h3>💰 {isHindi ? 'आपके कॉइन' : 'Your Apna Coins'}</h3>
          <p>{coins} / 100</p>
          <progress value={coins} max="100" aria-label="coin-progress-bar" />
          <button
            disabled={coins < 50}
            className="small-btn"
            onClick={handleRedeemCoins}
          >
            {isHindi ? 'रिडीम करें' : 'Redeem'}
          </button>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="home-column right-column">
        {/* 🎁 Offers & Bundles */}
        <motion.div className="home-card pastel2" whileHover={{ scale: 1.03 }}>
          <Lottie animationData={offerAnim} className="lottie-icon" />
          <h3>{isHindi ? 'ऑफ़र और बंडल्स' : 'Offers & Bundles'}</h3>
          <ul>
            {offers.map((offer) => (
              <li key={offer.id}>
                🎁 {offer.combo} - {offer.discount}
                <button className="small-btn" onClick={handleComboOrder}>
                  {isHindi ? 'ऑर्डर करें' : 'Order Combo'}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 📦 Active Orders */}
        <motion.div className="home-card pastel4" whileHover={{ scale: 1.03 }}>
          <h3>📦 {isHindi ? 'सक्रिय ऑर्डर' : 'Active Orders'}</h3>
          <ul>
            {activeOrders.map((order) => (
              <li key={order.id}>
                🚚 {order.item} - {
                  isHindi ? (
                    order.status === 'Out for Delivery' ? 'डिलीवरी के लिए निकला' :
                    order.status === 'Packed' ? 'पैकिंग हो गई' :
                    'विक्रेता सौंपा गया'
                  ) : order.status
                }
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomeSection;
