import React from 'react';
import { t } from '../../../content/strings';
import { STEPS } from '../content';
import SectionHeading from './SectionHeading';
import './HowItWorks.css';

const HowItWorks = () => (
  <section className="section" id="how" aria-labelledby="how-title">
    <SectionHeading id="how-title" eyebrow="howEyebrow" title="howTitle" />
    <ol className="steps-list">
      {STEPS.map((step, i) => (
        <li key={step} className="step">
          <span className="step-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <h3>{t(`${step}Title`)}</h3>
          <p>{t(`${step}Body`)}</p>
        </li>
      ))}
    </ol>
  </section>
);

export default HowItWorks;
