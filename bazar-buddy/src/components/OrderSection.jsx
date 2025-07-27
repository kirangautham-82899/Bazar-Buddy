import React, { useState, useEffect } from 'react';
import './OrderSection.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import {
  fetchCartFromFirebase,
  addToFirebaseCart,
  removeFromFirebaseCart,
  updateFirebaseCartItem
} from '../utils/firebaseCart';
import Lottie from 'lottie-react';
import deliveryAnim from '../assets/delivery.json';

const OrderSection = ({ language }) => {
  const isHindi = language === 'hi';
  const [user] = useAuthState(auth);
  const [cart, setCart] = useState([]);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showVerifiedOptions, setShowVerifiedOptions] = useState(false);
  const [priorityModes, setPriorityModes] = useState({});
  const [trackingVisible, setTrackingVisible] = useState(false);
  const [deliveryStage, setDeliveryStage] = useState(0);

  const [marketItems] = useState([
    { id: 1, name: 'Tomatoes', price: 20, category: 'Vegetables', trust: 4.8 },
    { id: 2, name: 'Potatoes', price: 15, category: 'Vegetables', trust: 4.5 },
    { id: 3, name: 'Onions', price: 25, category: 'Vegetables', trust: 4.9 },
    { id: 4, name: 'Combo: Veg Pack', price: 80, category: 'Combo', trust: 4.7 },
  ]);

  useEffect(() => {
    if (user) {
      fetchCartFromFirebase(user.uid, (data) => {
        setCart(data);
        const modes = {};
        data.forEach(item => {
          if (item.priorityMode) {
            modes[item.id] = item.priorityMode;
          }
        });
        setPriorityModes(modes);
      });
    }
  }, [user]);

  useEffect(() => {
    if (trackingVisible && deliveryStage < 3) {
      const timer = setTimeout(() => setDeliveryStage(prev => prev + 1), 2500);
      return () => clearTimeout(timer);
    }
  }, [trackingVisible, deliveryStage]);

  const handleAddToCart = (item) => {
    if (!user) return alert("Please log in");
    const existingItem = cart.find((i) => i.id === item.id);
    if (existingItem) {
      const updatedQty = existingItem.quantity + 1;
      updateFirebaseCartItem(user.uid, item.id, updatedQty, existingItem.deliveryType, priorityModes[item.id]);
      setCart((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: updatedQty } : i
        )
      );
    } else {
      const newItem = { ...item, quantity: 1, deliveryType: 'priority', priorityMode: '' };
      addToFirebaseCart(user.uid, newItem);
      setCart((prev) => [...prev, newItem]);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    if (!user) return;
    removeFromFirebaseCart(user.uid, itemId);
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    const newModes = { ...priorityModes };
    delete newModes[itemId];
    setPriorityModes(newModes);
  };

  const handleQuantityChange = (itemId, newQty) => {
    if (!user || newQty <= 0) return;
    const item = cart.find((i) => i.id === itemId);
    updateFirebaseCartItem(user.uid, itemId, newQty, item.deliveryType, priorityModes[itemId]);
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleDeliveryTypeChange = (itemId, newType) => {
    const item = cart.find((i) => i.id === itemId);
    updateFirebaseCartItem(user.uid, itemId, item.quantity, newType, priorityModes[itemId]);
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, deliveryType: newType } : item
      )
    );
  };

  const handlePriorityModeChange = (itemId, mode) => {
    setPriorityModes((prev) => ({
      ...prev,
      [itemId]: mode
    }));
    const item = cart.find((i) => i.id === itemId);
    if (item) {
      updateFirebaseCartItem(user.uid, item.id, item.quantity, item.deliveryType, mode);
    }
  };

  return (
    <motion.div
      className="order-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>{isHindi ? 'ऑर्डर अनुभाग' : '🛒 Order Section'}</h2>

      <div className="order-grid">
        {/* Market Items */}
        <div className="order-card">
          <h3>📈 {isHindi ? 'लाइव मूल्य' : 'Live Market Prices'}</h3>
          {marketItems.map((item) => (
            <p key={item.id}>
              {item.name}: ₹{item.price}/kg
              <button onClick={() => handleAddToCart(item)}>
                ➕ {isHindi ? 'जोड़ें' : 'Add'}
              </button>
            </p>
          ))}
        </div>

        {/* Trust Scores */}
        <div className="order-card">
          <h3>🛡️ {isHindi ? 'ट्रस्ट स्कोर' : 'Vendor Trust Score'}</h3>
          <ul>
            {marketItems.map((item) => (
              <li key={item.id}>
                {item.name} - ⭐ {item.trust}
              </li>
            ))}
          </ul>
        </div>

        {/* Delivery Options */}
        <div className="order-card">
          <h3>🚚 {isHindi ? 'डिलीवरी विकल्प' : 'Delivery Options'}</h3>

          <button
            className="delivery-btn"
            onClick={() => setShowPriorityOptions(!showPriorityOptions)}
          >
            ⚡ {isHindi ? 'प्राथमिकता समय' : 'Priority Timing Delivery'}
          </button>

          <button
            className="delivery-btn-secondary"
            onClick={() => setShowVerifiedOptions(!showVerifiedOptions)}
          >
            ✅ {isHindi ? 'डिजिटल पावती डिलीवरी' : 'Verified Digital Delivery'}
          </button>

          {showPriorityOptions && (
            <motion.div className="priority-options" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h4>⌛ {isHindi ? 'ऑर्डर कब प्राप्त करें चुनें' : 'Choose When to Receive Order'}</h4>
              <ul>
                <li>🚀 {isHindi ? 'एक्सप्रेस (अतिरिक्त ₹)' : 'Express (₹ extra)'}</li>
                <li>📅 {isHindi ? 'शेड्यूल (सुबह 6–7)' : 'Scheduled (6–7 AM)'}</li>
                <li>💰 {isHindi ? 'सेवर (24 घंटे में)' : 'Saver (24h)'}</li>
              </ul>
              <button onClick={() => setTrackingVisible(true)}>
                📦 {isHindi ? 'लाइव डिलीवरी ट्रैक करें' : 'Track Live Delivery'}
              </button>
            </motion.div>
          )}

          {showVerifiedOptions && (
            <motion.div className="verified-options" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h4>📲 {isHindi ? 'विक्रेता को पुष्टि भेजी जाती है' : 'Vendor Confirmation Sent'}</h4>
              <ul>
                <li>📤 {isHindi ? 'एसएमएस या कॉल द्वारा सूचना' : 'SMS or Call Notification'}</li>
                <li>🧾 {isHindi ? 'डिलीवरी प्रमाण सहित पारदर्शिता' : 'Proof-Based Delivery'}</li>
                <li>✅ <span style={{ color: 'green' }}>{isHindi ? 'सफल पुष्टि' : 'Confirmed'}</span></li>
              </ul>
              <div className="confirmation-badge">
                ✅ {isHindi ? 'डिलीवरी प्रमाण तैयार' : 'Delivery Proof Ready'}
              </div>
            </motion.div>
          )}
        </div>

        {/* Cart */}
        <div className="order-card">
          <h3>🧺 {isHindi ? 'आपकी टोकरी' : 'Your Cart'}</h3>
          {cart.length === 0 ? (
            <p>{isHindi ? 'कोई वस्तु नहीं' : 'No items in cart'}</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - ₹{item.price} × {item.quantity}
                  <div>
                    <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                    <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                    <button onClick={() => handleRemoveFromCart(item.id)} style={{ marginLeft: '12px', color: 'red' }}>❌</button>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <label>{isHindi ? 'डिलीवरी:' : 'Delivery:'}</label>
                    <select
                      value={item.deliveryType || 'priority'}
                      onChange={(e) => handleDeliveryTypeChange(item.id, e.target.value)}
                    >
                      <option value="priority">⚡ {isHindi ? 'प्राथमिकता' : 'Priority'}</option>
                      <option value="verified">✅ {isHindi ? 'डिजिटल' : 'Verified'}</option>
                    </select>
                  </div>
                  {item.deliveryType === 'priority' && (
                    <div className="priority-mode-selector">
                      <label><strong>{isHindi ? 'प्राथमिकता मोड:' : 'Priority Mode:'}</strong></label>
                      {['express', 'scheduled', 'saver'].map((mode) => (
                        <div key={mode}>
                          <label>
                            <input
                              type="radio"
                              name={`priority-${item.id}`}
                              value={mode}
                              checked={priorityModes[item.id] === mode}
                              onChange={() => handlePriorityModeChange(item.id, mode)}
                            />
                            {mode === 'express' ? '🚀' : mode === 'scheduled' ? '📅' : '💰'} {isHindi ? ({
                              express: 'एक्सप्रेस',
                              scheduled: 'शेड्यूल',
                              saver: 'सेवर'
                            }[mode]) : mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Live Delivery Tracker */}
      <AnimatePresence>
        {trackingVisible && (
          <motion.div className="tracking-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="tracking-card" initial={{ y: 50 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
              <h3>📦 {isHindi ? 'लाइव डिलीवरी ट्रैकर' : 'Live Delivery Tracker'}</h3>
              <Lottie animationData={deliveryAnim} loop style={{ height: 120 }} />
              <ol className="tracking-steps">
                <li className={deliveryStage >= 0 ? 'active' : ''}>{isHindi ? 'ऑर्डर किया गया' : 'Order Placed'}</li>
                <li className={deliveryStage >= 1 ? 'active' : ''}>{isHindi ? 'विक्रेता असाइन' : 'Vendor Assigned'}</li>
                <li className={deliveryStage >= 2 ? 'active' : ''}>{isHindi ? 'डिलीवरी पर' : 'Out for Delivery'}</li>
                <li className={deliveryStage >= 3 ? 'active' : ''}>{isHindi ? 'डिलीवर हो गया' : 'Delivered'}</li>
              </ol>
              {deliveryStage === 3 && (
                <button onClick={() => {
                  setTrackingVisible(false);
                  setDeliveryStage(0);
                }}>
                  ✅ {isHindi ? 'बंद करें' : 'Close'}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderSection;
