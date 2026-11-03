import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { t } from '../../../content/strings';
import { LANDING_FAQ } from '../content';
import SectionHeading from './SectionHeading';
import './Faq.css';

const Faq = () => (
  <section className="section section-split" id="faq" aria-labelledby="faq-title">
    <SectionHeading id="faq-title" eyebrow="faqEyebrow" title="faqLandingTitle" />
    {/* <details> keeps every answer in the HTML, so search engines can read them. */}
    <div className="faq-list">
      {LANDING_FAQ.map((n) => (
        <details key={n} className="faq">
          <summary>
            <span>{t(`faq${n}q`)}</span>
            <FaPlus className="faq-chevron" aria-hidden="true" />
          </summary>
          <p>{t(`faq${n}a`)}</p>
        </details>
      ))}
    </div>
  </section>
);

export default Faq;
