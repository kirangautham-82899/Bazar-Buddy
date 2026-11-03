import React from 'react';
import { t } from '../../../content/strings';

// Eyebrow + title (+ optional lead) used at the top of every landing section.
const SectionHeading = ({ id, eyebrow, title, lead, align = 'start' }) => (
  <div className={`section-head section-head-${align}`}>
    <p className="eyebrow">{t(eyebrow)}</p>
    <h2 id={id} className="section-title">{t(title)}</h2>
    {lead && <p className="section-lead">{t(lead)}</p>}
  </div>
);

export default SectionHeading;
