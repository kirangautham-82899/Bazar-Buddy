import React from 'react';
import { motion } from 'framer-motion';
import { GiBasket } from 'react-icons/gi';
import { t } from '../../content/strings';

// Full-screen: the brand tile breathes. Inline: a small spinner.
const Loader = ({ fullScreen = false }) => {
  return (
    <div className={fullScreen ? 'screen-center' : 'empty-state'} role="status">
      {fullScreen ? (
        <motion.span
          className="brand-mark-tile loader-tile"
          animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <GiBasket />
        </motion.span>
      ) : (
        <div className="spinner" aria-hidden="true" />
      )}
      <span className="visually-hidden">{t('loading')}</span>
    </div>
  );
};

export default Loader;
