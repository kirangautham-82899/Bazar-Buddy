import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Loader = ({ fullScreen = false }) => {
  const { t } = useLanguage();
  return (
    <div className={fullScreen ? 'screen-center' : 'empty-state'} role="status">
      <div className="spinner" aria-hidden="true" />
      <span className="visually-hidden">{t('loading')}</span>
    </div>
  );
};

export default Loader;
