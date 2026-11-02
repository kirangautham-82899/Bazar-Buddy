import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { Aurora, Magnetic, Reveal } from '../../../components/motion';
import { warmAuthProps } from '../warmAuth';
import './FinalCta.css';

const FinalCta = () => {
  const { t } = useLanguage();
  return (
    <section className="cta" aria-labelledby="cta-title">
      <Aurora variant="dark" />
      <Reveal className="cta-content">
        <h2 id="cta-title">{t('ctaTitle')}</h2>
        <p>{t('ctaBody')}</p>
        <Magnetic>
          <Link to="/auth?mode=register" className="btn btn-lg cta-btn" {...warmAuthProps}>
            {t('getStarted')} <FaArrowRight aria-hidden="true" />
          </Link>
        </Magnetic>
      </Reveal>
    </section>
  );
};

export default FinalCta;
