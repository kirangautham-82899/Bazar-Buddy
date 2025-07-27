import React from 'react';
import LanguageSelector from './LanguageSelector';
import './LoginScreen.css';
import bgImage from '../assets/splash-bg.png';

const LoginScreen = ({ onLanguageSelect }) => {
  return (
  <div
  className="login-container"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '420px', // ⬅️ moved further down
  }}
>
  <div className="language-center">
    <h2 className="language-title">Choose Your Language</h2>
    <LanguageSelector onSelect={onLanguageSelect} />
  </div>
</div>

  );
};

export default LoginScreen;
