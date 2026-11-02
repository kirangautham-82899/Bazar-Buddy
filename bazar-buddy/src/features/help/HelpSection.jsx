import React, { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronDown, FaPhoneAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORT_PHONE, TOLL_FREE } from '../../config/app';
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
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="page-title">🆘 {t('helpTitle')}</h1>

      <div className="grid grid-2">
        <section className="card help-card">
          <h2 className="card-title">📞 {t('callSupport')}</h2>
          <p className="muted">{t('callDesc')}</p>
          <a href={`tel:${SUPPORT_PHONE}`} className="btn btn-block">
            <FaPhoneAlt aria-hidden="true" /> {t('callNow')}
          </a>
        </section>

        <section className="card help-card">
          <h2 className="card-title">☎️ {t('tollFree')}</h2>
          <p className="muted">{t('tollDesc')}</p>
          <a href={`tel:${TOLL_FREE.replace(/-/g, '')}`} className="help-toll">{TOLL_FREE}</a>
        </section>
      </div>

      <section className="card help-faq">
        <h2 className="card-title">❓ {t('faqTitle')}</h2>
        {Array.from({ length: FAQ_COUNT }, (_, i) => (
          <FaqItem key={i} question={t(`faq${i + 1}q`)} answer={t(`faq${i + 1}a`)} />
        ))}
      </section>
    </motion.div>
  );
};

export default HelpSection;
