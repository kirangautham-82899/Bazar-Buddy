import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

// Shown in development when the Firebase env variables are missing.
const SetupScreen = () => {
  const { t } = useLanguage();
  return (
    <main className="screen-center">
      <h1 className="page-title">{t('setupTitle')}</h1>
      <p className="muted" style={{ maxWidth: 420 }}>{t('setupBody')}</p>
    </main>
  );
};

export default SetupScreen;
