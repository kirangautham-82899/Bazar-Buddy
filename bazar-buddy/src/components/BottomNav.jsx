import React from 'react';
import { FaStore, FaClipboardList, FaUser } from 'react-icons/fa';
import './BottomNav.css';

const BottomNav = ({ activeTab, setTab, language }) => {
  const isHindi = language === 'hi';

  return (
    <div className="bottom-nav">
      <div onClick={() => setTab('marketplace')} className={activeTab === 'marketplace' ? 'active' : ''}>
        <FaStore />
        <span>{isHindi ? 'बाज़ार' : 'Market'}</span>
      </div>
      <div onClick={() => setTab('orders')} className={activeTab === 'orders' ? 'active' : ''}>
        <FaClipboardList />
        <span>{isHindi ? 'आदेश' : 'Orders'}</span>
      </div>
      <div onClick={() => setTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>
        <FaUser />
        <span>{isHindi ? 'प्रोफ़ाइल' : 'Profile'}</span>
      </div>
    </div>
  );
};

export default BottomNav;
