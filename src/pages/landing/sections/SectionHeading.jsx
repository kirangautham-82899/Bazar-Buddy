import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Reveal } from '../../../components/motion';

// Eyebrow + title (+ optional lead) used at the top of every landing section.
const SectionHeading = ({ id, eyebrow, title, lead, align = 'center' }) => {
  const { t } = useLanguage();
  return (
    <Reveal className={`section-head section-head-${align}`}>
      <p className="eyebrow-text">{t(eyebrow)}</p>
      <h2 id={id} className="section-title">{t(title)}</h2>
      {lead && <p className="section-lead">{t(lead)}</p>}
    </Reveal>
  );
};

export default SectionHeading;
