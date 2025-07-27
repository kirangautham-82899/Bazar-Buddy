// src/components/WalletSection.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WalletSection.css';

const WalletSection = ({ language }) => {
  const isHindi = language === 'hi';

  const transactions = [
    { id: 1, item: 'Tomatoes', date: '26 Jul', amount: '₹60' },
    { id: 2, item: 'Combo Offer', date: '25 Jul', amount: '₹120' },
    { id: 3, item: 'Potatoes', date: '24 Jul', amount: '₹40' },
  ];

  const [showUPIModal, setShowUPIModal] = useState(false);
  const [redeemHistory, setRedeemHistory] = useState([
    { date: '23 Jul', reward: 'Free Delivery' },
  ]);

  const coins = 80;
  const savings = 65; // INR

  const handleRedeem = () => {
    setShowUPIModal(true);
    setRedeemHistory((prev) => [
      ...prev,
      { date: 'Today', reward: 'Free Delivery' },
    ]);
  };

  return (
    <motion.div
      className="wallet-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>{isHindi ? 'आपका वॉलेट' : 'Your Wallet'}</h2>

      <div className="wallet-grid">
  {/* Row 1: Coins & Savings */}
  <div className="wallet-card coins">
    <h3>💰 {isHindi ? 'अपना कॉइन' : 'Apna Coins'}</h3>
    <p>{coins} / 100</p>
    <progress value={coins} max="100" />
  </div>

  <div className="wallet-card savings">
    <h3>🎯 {isHindi ? 'आपकी बचत' : 'Your Savings'}</h3>
    <p>{isHindi ? `₹${savings} बचाए गए` : `₹${savings} saved`}</p>
  </div>

  {/* Row 2: Redeem & Redeem History */}
  <div className="wallet-card redeem">
    <h3>🎁 {isHindi ? 'रिडीम क्षेत्र' : 'Redeem Area'}</h3>
    <p>{isHindi ? 'फ्री डिलीवरी के लिए 50 कॉइन का उपयोग करें' : 'Use 50 coins for Free Delivery'}</p>
    <button disabled={coins < 50} onClick={handleRedeem}>
      {isHindi ? 'रिडीम करें' : 'Redeem Now'}
    </button>
  </div>

  <div className="wallet-card history">
    <h3>🎉 {isHindi ? 'रिडीम इतिहास' : 'Redeem History'}</h3>
    <ul>
      {redeemHistory.map((entry, idx) => (
        <li key={idx}>
          {isHindi
            ? `${entry.reward} - ${entry.date}`
            : `${entry.reward} - ${entry.date}`}
        </li>
      ))}
    </ul>
  </div>
</div>

{/* Full-width block for Transaction History */}
<div className="wallet-card full-width">
  <h3>📜 {isHindi ? 'लेन-देन इतिहास' : 'Transaction History'}</h3>
  <ul>
    {transactions.map((tx) => (
      <li key={tx.id}>
        <strong>{tx.item}</strong> - {tx.amount}{' '}
        <small>({tx.date})</small>
      </li>
    ))}
  </ul>
</div>


      {/* UPI Modal */}
      <AnimatePresence>
        {showUPIModal && (
          <motion.div
            className="upi-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="upi-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3>{isHindi ? 'UPI भुगतान' : 'UPI Payment'}</h3>
              <img
                className="upi-qr"
                src="/upi-mock-qr.png"
                alt="UPI QR"
              />
              <p>
                {isHindi
                  ? 'भुगतान करने के लिए QR को स्कैन करें'
                  : 'Scan the QR to complete payment'}
              </p>
              <button onClick={() => setShowUPIModal(false)}>
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WalletSection;
