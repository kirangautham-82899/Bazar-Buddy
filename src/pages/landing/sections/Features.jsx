import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { Stagger, staggerItem } from '../../../components/motion';
import { FEATURES } from '../content';
import SectionHeading from './SectionHeading';
import './Features.css';

const Features = () => {
  const { t } = useLanguage();
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <SectionHeading id="features-title" eyebrow="featuresEyebrow" title="featuresTitle" />
      <Stagger as="ul" className="feature-grid" inView stagger={0.07}>
        {FEATURES.map(({ icon: Icon, title, body, tone }) => (
          <motion.li key={title} className={`feature tone-${tone}`} variants={staggerItem}>
            <motion.span className="feature-icon" aria-hidden="true" whileHover={{ rotate: -12, scale: 1.12 }}>
              <Icon />
            </motion.span>
            <h3>{t(title)}</h3>
            <p>{t(body)}</p>
          </motion.li>
        ))}
      </Stagger>
    </section>
  );
};

export default Features;
