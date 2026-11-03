import React from 'react';
import { t } from '../../../content/strings';
import { FEATURES } from '../content';
import SectionHeading from './SectionHeading';
import './Features.css';

const Features = () => (
  <section className="section" id="features" aria-labelledby="features-title">
    <SectionHeading id="features-title" eyebrow="featuresEyebrow" title="featuresTitle" />
    <ul className="feature-grid">
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <li key={title} className="feature">
          <span className="feature-icon" aria-hidden="true">
            <Icon />
          </span>
          <h3>{t(title)}</h3>
          <p>{t(body)}</p>
        </li>
      ))}
    </ul>
  </section>
);

export default Features;
