import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheck } from 'react-icons/fa';
import { t } from '../../../content/strings';
import { HERO_TRUST } from '../content';
import { warmAuthProps } from '../warmAuth';
import PhoneMock from './PhoneMock';
import './Hero.css';

// Headline, one primary action, three reasons to trust it, and the app at work.
// Static by design: everything is readable at first paint, with or without JavaScript.
const Hero = () => (
  <section className="hero" aria-labelledby="hero-title">
    <div className="hero-inner">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">
          <span className="live-dot" aria-hidden="true" /> {t('heroEyebrow')}
        </p>
        <h1 id="hero-title" className="hero-title">{t('heroTitle')}</h1>
        <p className="hero-subtitle">{t('heroSubtitle')}</p>
        <div className="hero-ctas">
          <Link to="/shop" className="btn btn-lg" {...warmAuthProps}>
            {t('startShopping')} <FaArrowRight aria-hidden="true" />
          </Link>
          <Link to="/auth" className="btn btn-lg btn-outline" {...warmAuthProps}>
            {t('navLogin')}
          </Link>
        </div>
        <ul className="hero-trust">
          {HERO_TRUST.map((key) => (
            <li key={key}>
              <FaCheck aria-hidden="true" /> {t(key)}
            </li>
          ))}
        </ul>
      </div>
      <div className="hero-visual">
        <PhoneMock />
      </div>
    </div>
  </section>
);

export default Hero;
