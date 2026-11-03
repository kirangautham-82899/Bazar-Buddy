import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { t } from '../../../content/strings';
import { warmAuthProps } from '../warmAuth';
import './FinalCta.css';

const FinalCta = () => (
  <section className="section" aria-labelledby="cta-title">
    <div className="cta">
      <div>
        <h2 id="cta-title">{t('ctaTitle')}</h2>
        <p>{t('ctaBody')}</p>
      </div>
      <Link to="/shop" className="btn btn-lg cta-btn" {...warmAuthProps}>
        {t('startShopping')} <FaArrowRight aria-hidden="true" />
      </Link>
    </div>
  </section>
);

export default FinalCta;
