import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../../i18n/translations';

// EN / हिं switch with a pill that slides between options.
const LanguageToggle = ({ onChange, short = false }) => {
  const { t, language, setLanguage } = useLanguage();
  const pillId = useId();

  const choose = (code) => {
    setLanguage(code);
    onChange?.(code);
  };

  return (
    <div className="segmented" role="group" aria-label={t('languageLabel')}>
      {LANGUAGE_OPTIONS.map(({ code, label, short: shortLabel }) => (
        <button
          key={code}
          type="button"
          lang={code}
          className={`segmented-btn ${language === code ? 'active' : ''}`}
          aria-pressed={language === code}
          onClick={() => choose(code)}
        >
          {language === code && (
            <motion.span layoutId={pillId} className="segmented-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          )}
          {short ? shortLabel : label}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
