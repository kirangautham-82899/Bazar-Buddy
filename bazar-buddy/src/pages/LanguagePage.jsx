import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import bgImage from '../assets/images/splash-bg.png';
import './LanguagePage.css';

const OPTIONS = [
  { code: 'en', label: 'English', hint: 'Continue in English' },
  { code: 'hi', label: 'हिन्दी', hint: 'हिन्दी में आगे बढ़ें' },
];

const LanguagePage = () => {
  const { hasChosenLanguage, setLanguage } = useLanguage();
  const navigate = useNavigate();

  if (hasChosenLanguage) return <Navigate to="/auth" replace />;

  const choose = (code) => {
    setLanguage(code);
    navigate('/auth');
  };

  return (
    <main className="language-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <motion.section
        className="language-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        aria-labelledby="language-title"
      >
        <h1 className="language-brand">Bazar Buddy · बाज़ार बडी</h1>
        <h2 id="language-title" className="language-title">
          Choose your language · अपनी भाषा चुनें
        </h2>
        <div className="language-options">
          {OPTIONS.map((opt) => (
            <button key={opt.code} type="button" className="language-option" lang={opt.code} onClick={() => choose(opt.code)}>
              <span className="language-option-label">{opt.label}</span>
              <span className="language-option-hint">{opt.hint}</span>
            </button>
          ))}
        </div>
      </motion.section>
    </main>
  );
};

export default LanguagePage;
