import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { t } from '../../../content/strings';
import { Aurora, Magnetic, Reveal } from '../../../components/motion';
import { warmAuthProps } from '../warmAuth';
import './FinalCta.css';

const FinalCta = () => {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <Aurora variant="dark" />
      <Reveal className="cta-content">
        <h2 id="cta-title">{t('ctaTitle')}</h2>
        <p>{t('ctaBody')}</p>
        <Magnetic>
          <Link to="/shop" className="btn btn-lg cta-btn" {...warmAuthProps}>
            {t('startShopping')} <FaArrowRight aria-hidden="true" />
          </Link>
        </Magnetic>
      </Reveal>
    </section>
  );
};

export default FinalCta;
