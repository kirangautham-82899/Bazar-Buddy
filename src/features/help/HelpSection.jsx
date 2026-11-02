import React, { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronDown, FaHeadset, FaPhoneAlt, FaPhoneVolume, FaQuestion } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORT_PHONE, TOLL_FREE } from '../../config/app';
import { Reveal, Stagger, staggerItem } from '../../components/motion';
import './HelpSection.css';

const FAQ_COUNT = 5;

const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="faq-item">
      <h3 className="faq-heading">
        <button type="button" className="faq-question" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          <span>{question}</span>
          <FaChevronDown className={open ? 'faq-chevron open' : 'faq-chevron'} aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HelpSection = () => {
  const { t } = useLanguage();
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('helpTitle')}</h1>
        <p className="page-subtitle">{t('helpSubtitle')}</p>
      </header>

      <Stagger className="grid grid-2">
        <motion.section className="card help-card" variants={staggerItem}>
          <h2 className="card-title">
            <span className="card-title-icon"><FaHeadset aria-hidden="true" /></span>
            {t('callSupport')}
          </h2>
          <p className="muted">{t('callDesc')}</p>
          <a href={`tel:${SUPPORT_PHONE}`} className="btn btn-block">
            <FaPhoneAlt aria-hidden="true" /> {t('callNow')}
          </a>
        </motion.section>

        <motion.section className="card help-card" variants={staggerItem}>
          <h2 className="card-title">
            <span className="card-title-icon"><FaPhoneVolume aria-hidden="true" /></span>
            {t('tollFree')}
          </h2>
          <p className="muted">{t('tollDesc')}</p>
          <a href={`tel:${TOLL_FREE.replace(/-/g, '')}`} className="help-toll gradient-text">{TOLL_FREE}</a>
        </motion.section>
      </Stagger>

      <Reveal as="section" className="card help-faq" delay={0.15}>
        <h2 className="card-title">
          <span className="card-title-icon"><FaQuestion aria-hidden="true" /></span>
          {t('faqTitle')}
        </h2>
        {Array.from({ length: FAQ_COUNT }, (_, i) => (
          <FaqItem key={i} question={t(`faq${i + 1}q`)} answer={t(`faq${i + 1}a`)} />
        ))}
      </Reveal>
    </div>
  );
};

export default HelpSection;
