import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { t } from '../../../content/strings';
import { Stagger, staggerItem } from '../../../components/motion';
import { LANDING_FAQ } from '../content';
import SectionHeading from './SectionHeading';
import './Faq.css';

const Faq = () => {
  return (
    <section className="section section-narrow" id="faq" aria-labelledby="faq-title">
      <SectionHeading id="faq-title" eyebrow="faqEyebrow" title="faqLandingTitle" />
      {/* <details> keeps every answer in the HTML, so search engines can read them. */}
      <Stagger className="faq-list" inView stagger={0.06}>
        {LANDING_FAQ.map((n) => (
          <motion.details key={n} className="faq" variants={staggerItem}>
            <summary>
              <span>{t(`faq${n}q`)}</span>
              <FaChevronDown className="faq-chevron" aria-hidden="true" />
            </summary>
            <p>{t(`faq${n}a`)}</p>
          </motion.details>
        ))}
      </Stagger>
    </section>
  );
};

export default Faq;
