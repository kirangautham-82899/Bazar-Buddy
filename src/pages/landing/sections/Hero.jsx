import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaArrowRight, FaCheck } from 'react-icons/fa';
import { t } from '../../../content/strings';
import starterCatalog from '../../../data/starterCatalog';
import ProductIcon from '../../../components/common/ProductIcon';
import { Aurora, Magnetic, Stagger, WordReveal, staggerItem } from '../../../components/motion';
import { HERO_PRODUCE, HERO_TRUST } from '../content';
import { warmAuthProps } from '../warmAuth';
import PhoneMock from './PhoneMock';
import './Hero.css';

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Parallax: the phone and the produce drift at different speeds on scroll.
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const produceY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="hero" aria-labelledby="hero-title">
      <Aurora />
      <div className="hero-inner">
        <motion.div className="hero-copy" style={{ opacity: fade }}>
          <motion.p className="hero-eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="live-dot" aria-hidden="true" /> {t('heroEyebrow')}
          </motion.p>

          <WordReveal key={t('heroTitle')} as="h1" className="hero-title" text={t('heroTitle')} delay={0.1} />

          <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}>
            {t('heroSubtitle')}
          </motion.p>

          <motion.div className="hero-ctas" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65 }}>
            <Magnetic>
              <Link to="/shop" className="btn btn-lg" {...warmAuthProps}>
                {t('startShopping')} <FaArrowRight aria-hidden="true" />
              </Link>
            </Magnetic>
            <Link to="/auth" className="text-link" {...warmAuthProps}>
              {t('navLogin')} <FaArrowRight aria-hidden="true" />
            </Link>
          </motion.div>

          <Stagger as="ul" className="hero-trust" delay={0.85}>
            {HERO_TRUST.map((key) => (
              <motion.li key={key} variants={staggerItem}>
                <FaCheck aria-hidden="true" /> {t(key)}
              </motion.li>
            ))}
          </Stagger>
        </motion.div>

        <motion.div
          className="hero-visual"
          style={{ y: phoneY }}
          initial={{ opacity: 0, y: 60, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 70, damping: 16, delay: 0.3 }}
        >
          <PhoneMock />
          <motion.div className="hero-produce" style={{ y: produceY }} aria-hidden="true">
            {HERO_PRODUCE.map((id, i) => {
              const product = starterCatalog.find((p) => p.id === id);
              return (
                <motion.span
                  key={id}
                  className={`produce produce-${i}`}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1, y: [0, i % 2 ? 10 : -10, 0], rotate: [0, i % 2 ? -8 : 8, 0] }}
                  transition={{
                    opacity: { delay: 0.6 + i * 0.1 },
                    scale: { type: 'spring', delay: 0.6 + i * 0.1 },
                    y: { duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  <ProductIcon icon={product.icon} category={product.category} size="md" />
                </motion.span>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
