import React from 'react';
import './LanguageSelector.css';

const LanguageSelector = ({ onSelect }) => {
  return (
    <div className="language-buttons">
      <button onClick={() => onSelect('en')} className="lang-btn english">
        🇬🇧 English
      </button>
      <button onClick={() => onSelect('hi')} className="lang-btn hindi">
        🇮🇳 हिंदी
      </button>
    </div>
  );
};

export default LanguageSelector;
