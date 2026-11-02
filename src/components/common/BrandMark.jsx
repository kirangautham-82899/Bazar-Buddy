import React from 'react';
import { motion } from 'framer-motion';
import { GiBasket } from 'react-icons/gi';
import { t } from '../../content/strings';
import './BrandMark.css';

// Logo built from an icon and type, no image file.
const BrandMark = ({ light = false, compact = false }) => {
  return (
    <span className={`brand-mark ${light ? 'brand-mark-light' : ''}`}>
      <motion.span
        className="brand-mark-tile"
        whileHover={{ rotate: -8, scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        aria-hidden="true"
      >
        <GiBasket />
      </motion.span>
      {!compact && <span className="brand-mark-name">{t('appName')}</span>}
    </span>
  );
};

export default BrandMark;
