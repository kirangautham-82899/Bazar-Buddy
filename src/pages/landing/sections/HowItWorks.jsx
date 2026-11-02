import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { Reveal } from '../../../components/motion';
import { STEPS } from '../content';
import SectionHeading from './SectionHeading';
import './HowItWorks.css';

const HowItWorks = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  // The line joining the steps draws itself as the section scrolls past.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section className="section" id="how" ref={ref} aria-labelledby="how-title">
      <SectionHeading id="how-title" eyebrow="howEyebrow" title="howTitle" />
      <div className="steps">
        <div className="steps-track" aria-hidden="true">
          <motion.span className="steps-fill steps-fill-y" style={{ scaleY: progress }} />
          <motion.span className="steps-fill steps-fill-x" style={{ scaleX: progress }} />
        </div>
        <ol className="steps-list">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step} className="step" delay={i * 0.12}>
              <span className="step-number" aria-hidden="true">{i + 1}</span>
              <h3>{t(`${step}Title`)}</h3>
              <p>{t(`${step}Body`)}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
