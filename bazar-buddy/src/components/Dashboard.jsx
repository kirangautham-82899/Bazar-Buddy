import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';

import deliveryAnim from '../assets/delivery.json';
import qrCodeImage from '../assets/upi-qr.png';

import TopNavbar from './TopNavbar';
import TradeSection from './TradeSection';
import WalletSection from './WalletSection';
import HomeSection from './HomeSection';
import ProfileSection from './ProfileSection.jsx';
import OrderSection from './OrderSection.jsx';
import HelpSection from './HelpSection.jsx';

import { FaHome, FaUser, FaQuestionCircle } from 'react-icons/fa';

const Dashboard = () => {
  const [showQR, setShowQR] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [deliveryStage, setDeliveryStage] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (showTracking && deliveryStage < 3) {
      const timer = setTimeout(() => setDeliveryStage(prev => prev + 1), 2500);
      return () => clearTimeout(timer);
    }
  }, [deliveryStage, showTracking]);

  return (
    <motion.div className="dashboard-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <TopNavbar />

      <main className="dashboard-main-content">
        {activeTab === 'home' && <HomeSection />}
        {activeTab === 'orders' && <OrderSection cart={cart} setCart={setCart} />}
        {activeTab === 'wallet' && <WalletSection />}
        {activeTab === 'trade' && <TradeSection />}
        {activeTab === 'profile' && <ProfileSection />}
        {activeTab === 'help' && <HelpSection />}
      </main>

      {/* QR Payment */}
      <AnimatePresence>
        {showQR && (
          <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ y: 50 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
              <h3>Pay via UPI</h3>
              <img src={qrCodeImage} alt="UPI QR Code" className="qr-image" />
              <button onClick={() => {
                setShowQR(false);
                setShowTracking(true);
                setDeliveryStage(0);
              }}>
                Payment Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery Modal */}
      <AnimatePresence>
        {showTracking && (
          <motion.div className="modal tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ y: 30 }} animate={{ y: 0 }} transition={{ duration: 0.4 }}>
              <h3>Delivery Status</h3>
              <Lottie animationData={deliveryAnim} loop style={{ height: 100 }} />
              <ol className="tracking-steps">
                <li className={deliveryStage >= 0 ? 'active' : ''}>Order Placed</li>
                <li className={deliveryStage >= 1 ? 'active' : ''}>Vendor Assigned</li>
                <li className={deliveryStage >= 2 ? 'active' : ''}>Out for Delivery</li>
                <li className={deliveryStage >= 3 ? 'active' : ''}>Delivered</li>
              </ol>
              {deliveryStage === 3 && (
                <button onClick={() => setShowTracking(false)}>
                  Close
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.footer className="bottom-nav" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <FaHome />
          <span>Home</span>
        </div>
        <div className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          🛒<span>Orders</span>
        </div>
        <div className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
          💰<span>Wallet</span>
        </div>
        <div className={`nav-item ${activeTab === 'trade' ? 'active' : ''}`} onClick={() => setActiveTab('trade')}>
          🤝<span>Trade</span>
        </div>
        <div className={`nav-item ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>
          <FaQuestionCircle />
          <span>Help</span>
        </div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <FaUser />
          <span>Profile</span>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Dashboard;
