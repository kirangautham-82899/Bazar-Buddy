import React from 'react';
import './TopNavbar.css';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import logoAnim from '../assets/shopping.json';

const TopNavbar = ({ language }) => {
  const isHindi = language === 'hi';

  return (
    <motion.div
      className="top-navbar"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-left">
        <Lottie animationData={logoAnim} loop style={{ height: 60 }} />
        <h1 className="brand-name">
          {isHindi ? 'बाज़ार बडी' : 'Bazar Buddy'}
        </h1>
      </div>

      <div className="navbar-right">
        <select className="language-select">
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
      </div>
    </motion.div>
  );
};

export default TopNavbar;
