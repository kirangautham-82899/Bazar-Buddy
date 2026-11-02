import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  FaArrowRight,
  FaBalanceScale,
  FaCheckCircle,
  FaCoins,
  FaMicrophone,
  FaPhoneAlt,
  FaShieldAlt,
  FaShippingFast,
  FaUsers,
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { catalog } from '../../data/products';
import vendorGroups from '../../data/vendorGroups';
import { SUPPORT_PHONE, TOLL_FREE } from '../../config/app';
import { productName } from '../../utils/format';
import BrandMark from '../../components/common/BrandMark';
import LanguageToggle from '../../components/common/LanguageToggle';
import ProductIcon from '../../components/common/ProductIcon';
import { AnimatedNumber, Aurora, Magnetic, Reveal, Stagger, TiltCard, WordReveal, staggerItem } from '../../components/motion';
import { loadAppShell, loadAuthPage, prefetchWhenIdle } from '../../routes/lazy';
import { onSignedIn } from '../../routes/sessionCheck';
import PhoneMock from './PhoneMock';
import './LandingPage.css';

// Start fetching the login screen as soon as a finger or cursor heads for a CTA.
const warmAuth = () => {
  loadAppShell().catch(() => {});
  loadAuthPage().catch(() => {});
};

const FEATURES = [
  { icon: FaMicrophone, title: 'feat1Title', body: 'feat1Body', tone: 'pink' },
  { icon: FaBalanceScale, title: 'feat2Title', body: 'feat2Body', tone: 'violet' },
  { icon: FaShippingFast, title: 'feat3Title', body: 'feat3Body', tone: 'amber' },
  { icon: FaShieldAlt, title: 'feat4Title', body: 'feat4Body', tone: 'green' },
  { icon: FaCoins, title: 'feat5Title', body: 'feat5Body', tone: 'gold' },
  { icon: FaUsers, title: 'feat6Title', body: 'feat6Body', tone: 'sky' },
];

const STEPS = [
  { title: 'step1Title', body: 'step1Body' },
  { title: 'step2Title', body: 'step2Body' },
  { title: 'step3Title', body: 'step3Body' },
];

const Hero = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Parallax: the phone and floating chips drift at different speeds on scroll.
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const chipY1 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const chipY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="hero">
      <Aurora />
      <div className="hero-inner">
        <motion.div className="hero-copy" style={{ opacity: fade }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="live-dot" aria-hidden="true" /> {t('heroEyebrow')}
          </motion.span>

          <WordReveal key={t('heroTitle')} as="h1" className="hero-title" text={t('heroTitle')} delay={0.1} />

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            <Magnetic>
              <Link to="/auth?mode=register" className="btn btn-lg" onPointerEnter={warmAuth} onFocus={warmAuth} onTouchStart={warmAuth}>
                {t('getStarted')} <FaArrowRight aria-hidden="true" />
              </Link>
            </Magnetic>
            <Link to="/auth" className="btn btn-lg btn-outline" onPointerEnter={warmAuth} onFocus={warmAuth} onTouchStart={warmAuth}>
              {t('haveAccountCta')}
            </Link>
          </motion.div>

          <Stagger as="ul" className="hero-trust" delay={0.85}>
            {['heroTrust1', 'heroTrust2', 'heroTrust3'].map((k) => (
              <motion.li key={k} variants={staggerItem}>
                <FaCheckCircle aria-hidden="true" /> {t(k)}
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
          <motion.div className="float-chip chip-coins" style={{ y: chipY1 }} aria-hidden="true">
            <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
              <FaCoins /> +12 {t('apnaCoins')}
            </motion.span>
          </motion.div>
          <motion.div className="float-chip chip-otp" style={{ y: chipY2 }} aria-hidden="true">
            <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}>
              <FaShieldAlt /> OTP 4821
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Stats = () => {
  const { t } = useLanguage();
  // Real figures from the app's own data, not marketing numbers.
  const stats = [
    { value: catalog.length, label: 'statProducts' },
    { value: vendorGroups.length, label: 'statGroups' },
    { value: 2, label: 'statLanguages' },
    { value: 45, label: 'statExpress' },
  ];
  return (
    <section className="stats" aria-label={t('statsLabel')}>
      <Stagger className="stats-inner" inView>
        {stats.map((s) => (
          <motion.div key={s.label} className="stat" variants={staggerItem}>
            <span className="stat-value gradient-text">
              <AnimatedNumber value={s.value} />
            </span>
            <span className="stat-label">{t(s.label)}</span>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
};

const Features = () => {
  const { t } = useLanguage();
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <Reveal className="section-head">
        <span className="eyebrow">{t('featuresEyebrow')}</span>
        <h2 id="features-title" className="section-title">{t('featuresTitle')}</h2>
      </Reveal>
      <Stagger as="ul" className="feature-grid" inView stagger={0.1}>
        {FEATURES.map(({ icon: Icon, title, body, tone }) => (
          <motion.li key={title} variants={staggerItem}>
            <TiltCard className={`feature-card tone-card-${tone}`}>
              <span className="feature-icon" aria-hidden="true">
                <Icon />
              </span>
              <h3>{t(title)}</h3>
              <p>{t(body)}</p>
            </TiltCard>
          </motion.li>
        ))}
      </Stagger>
    </section>
  );
};

const HowItWorks = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  // The connecting line draws itself as the section scrolls past.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section className="section how" ref={ref} aria-labelledby="how-title">
      <Reveal className="section-head">
        <span className="eyebrow">{t('howEyebrow')}</span>
        <h2 id="how-title" className="section-title">{t('howTitle')}</h2>
      </Reveal>
      <div className="steps">
        <div className="steps-track" aria-hidden="true">
          <motion.span className="steps-fill steps-fill-y" style={{ scaleY: progress }} />
          <motion.span className="steps-fill steps-fill-x" style={{ scaleX: progress }} />
        </div>
        {STEPS.map((step, i) => (
          <Reveal key={step.title} className="step" delay={i * 0.12}>
            <span className="step-number">{i + 1}</span>
            <h3>{t(step.title)}</h3>
            <p>{t(step.body)}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const Marquee = () => {
  const { language, t } = useLanguage();
  const items = catalog.filter((p) => p.category !== 'combo');
  const row = [...items, ...items];
  return (
    <section className="marquee" aria-label={t('marqueeLabel')}>
      <div className="marquee-track">
        {row.map((p, i) => (
          <span key={`${p.id}-${i}`} className="marquee-item" aria-hidden={i >= items.length}>
            <ProductIcon id={p.id} category={p.category} size="sm" />
            {productName(p, language)}
          </span>
        ))}
      </div>
    </section>
  );
};

const FinalCta = () => {
  const { t } = useLanguage();
  return (
    <section className="section">
      <Reveal className="cta-band">
        <Aurora variant="dark" />
        <div className="cta-content">
          <h2>{t('ctaTitle')}</h2>
          <p>{t('ctaBody')}</p>
          <Magnetic>
            <Link to="/auth?mode=register" className="btn btn-lg cta-btn" onPointerEnter={warmAuth} onFocus={warmAuth} onTouchStart={warmAuth}>
              {t('getStarted')} <FaArrowRight aria-hidden="true" />
            </Link>
          </Magnetic>
        </div>
      </Reveal>
    </section>
  );
};

const LandingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();

  // After first paint: prefetch the app and send signed-in vendors to their dashboard.
  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;
    const cancelPrefetch = prefetchWhenIdle(loadAppShell, loadAuthPage);
    const idle = (fn) => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1200));
    idle(() => {
      onSignedIn(() => navigate('/dashboard', { replace: true }))
        .then((stop) => (active ? (unsubscribe = stop) : stop()))
        .catch(() => {});
    });
    return () => {
      active = false;
      cancelPrefetch();
      unsubscribe();
    };
  }, [navigate]);
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <div className="landing">
      <motion.div className="scroll-progress" style={{ scaleX: bar }} aria-hidden="true" />

      <header className="landing-nav">
        <Link to="/" className="landing-brand" aria-label={t('appName')}>
          <BrandMark />
        </Link>
        <nav className="landing-nav-actions">
          <LanguageToggle short />
          <Link to="/auth" className="btn btn-sm btn-outline landing-login" onPointerEnter={warmAuth} onFocus={warmAuth} onTouchStart={warmAuth}>
            {t('navLogin')}
          </Link>
        </nav>
      </header>

      <main>
        <Hero />
        <Stats />
        <Features />
        <Marquee />
        <HowItWorks />
        <FinalCta />
      </main>

      <footer className="landing-footer">
        <BrandMark />
        <p className="muted">{t('footerTagline')}</p>
        <div className="footer-links">
          <a href={`tel:${SUPPORT_PHONE}`}>
            <FaPhoneAlt aria-hidden="true" /> {t('callSupport')}
          </a>
          <a href={`tel:${TOLL_FREE.replace(/-/g, '')}`}>{TOLL_FREE}</a>
        </div>
        <p className="small muted">{t('footerRights', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
