import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  FaArrowRight,
  FaBalanceScale,
  FaCheck,
  FaChevronDown,
  FaCoins,
  FaMapMarkerAlt,
  FaMicrophone,
  FaPhoneAlt,
  FaShieldAlt,
  FaShippingFast,
  FaUsers,
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { catalog, CATEGORIES, CATEGORY_LABEL_KEYS } from '../../data/products';
import vendorGroups, { servedAreas } from '../../data/vendorGroups';
import { SUPPORT_PHONE, TOLL_FREE } from '../../config/app';
import { productName } from '../../utils/format';
import BrandMark from '../../components/common/BrandMark';
import LanguageToggle from '../../components/common/LanguageToggle';
import ProductIcon, { toneFor } from '../../components/common/ProductIcon';
import { AnimatedNumber, Aurora, Magnetic, Reveal, Stagger, WordReveal, staggerItem } from '../../components/motion';
import { loadAppShell, loadAuthPage, prefetchWhenIdle } from '../../routes/lazy';
import { onSignedIn } from '../../routes/sessionCheck';
import { FAQ_NUMBERS } from '../../seo/structuredData';
import PhoneMock from './PhoneMock';
import './LandingPage.css';

const FEATURES = [
  { icon: FaMicrophone, title: 'feat1Title', body: 'feat1Body', tone: 'green' },
  { icon: FaBalanceScale, title: 'feat2Title', body: 'feat2Body', tone: 'tomato' },
  { icon: FaShippingFast, title: 'feat3Title', body: 'feat3Body', tone: 'turmeric' },
  { icon: FaShieldAlt, title: 'feat4Title', body: 'feat4Body', tone: 'green' },
  { icon: FaCoins, title: 'feat5Title', body: 'feat5Body', tone: 'turmeric' },
  { icon: FaUsers, title: 'feat6Title', body: 'feat6Body', tone: 'tomato' },
];

const STEPS = ['step1', 'step2', 'step3'];

const FLOATING_PRODUCE = ['tomato', 'carrot', 'green-chilli', 'lemon', 'onion', 'garlic'];

// Start fetching the login screen as soon as a finger or cursor heads for a CTA.
const warmAuth = () => {
  loadAppShell().catch(() => {});
  loadAuthPage().catch(() => {});
};
const warmProps = { onPointerEnter: warmAuth, onFocus: warmAuth, onTouchStart: warmAuth };

const Nav = () => {
  const { t } = useLanguage();
  return (
    <header className="landing-nav">
      <Link to="/" className="landing-brand" aria-label={t('appName')}>
        <BrandMark />
      </Link>
      <nav className="landing-links" aria-label={t('mainNav')}>
        <a href="#features">{t('navFeatures')}</a>
        <a href="#how">{t('navHow')}</a>
        <a href="#faq">{t('navFaq')}</a>
      </nav>
      <div className="landing-nav-actions">
        <LanguageToggle short />
        <Link to="/auth" className="btn btn-sm landing-login" {...warmProps}>
          {t('navLogin')}
        </Link>
      </div>
    </header>
  );
};

const Hero = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Parallax: phone and produce drift at different speeds as the page scrolls.
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const produceY = useTransform(scrollYProgress, [0, 1], [0, -180]);
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
              <Link to="/auth?mode=register" className="btn btn-lg" {...warmProps}>
                {t('getStarted')} <FaArrowRight aria-hidden="true" />
              </Link>
            </Magnetic>
            <Link to="/auth" className="text-link" {...warmProps}>
              {t('haveAccountCta')} <FaArrowRight aria-hidden="true" />
            </Link>
          </motion.div>

          <Stagger as="ul" className="hero-trust" delay={0.85}>
            {['heroTrust1', 'heroTrust2', 'heroTrust3'].map((k) => (
              <motion.li key={k} variants={staggerItem}>
                <FaCheck aria-hidden="true" /> {t(k)}
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
            {FLOATING_PRODUCE.map((id, i) => {
              const p = catalog.find((x) => x.id === id);
              return (
                <motion.span
                  key={id}
                  className={`produce produce-${i}`}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1, y: [0, i % 2 ? 10 : -10, 0], rotate: [0, i % 2 ? -8 : 8, 0] }}
                  transition={{
                    opacity: { delay: 0.6 + i * 0.08 },
                    scale: { type: 'spring', delay: 0.6 + i * 0.08 },
                    y: { duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  <ProductIcon id={p.id} category={p.category} size="md" />
                </motion.span>
              );
            })}
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
      <Stagger className="stats-row" inView>
        {stats.map((s) => (
          <motion.div key={s.label} className="stat" variants={staggerItem}>
            <span className="stat-value">
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
    <section className="section split" id="features" aria-labelledby="features-title">
      <Reveal className="split-head">
        <p className="eyebrow-text">{t('featuresEyebrow')}</p>
        <h2 id="features-title" className="section-title">{t('featuresTitle')}</h2>
      </Reveal>
      <Stagger as="ul" className="feature-list" inView stagger={0.08}>
        {FEATURES.map(({ icon: Icon, title, body, tone }) => (
          <motion.li key={title} className={`feature tone-${tone}`} variants={staggerItem}>
            <motion.span className="feature-icon" aria-hidden="true" whileHover={{ rotate: -12, scale: 1.15 }}>
              <Icon />
            </motion.span>
            <div>
              <h3>{t(title)}</h3>
              <p>{t(body)}</p>
            </div>
          </motion.li>
        ))}
      </Stagger>
    </section>
  );
};

const Categories = () => {
  const { t, language } = useLanguage();
  return (
    <section className="section" aria-labelledby="categories-title">
      <Reveal className="section-head">
        <p className="eyebrow-text">{t('categoriesEyebrow')}</p>
        <h2 id="categories-title" className="section-title">{t('categoriesTitle')}</h2>
        <p className="section-lead">{t('categoriesBody')}</p>
      </Reveal>
      <Stagger className="category-columns" inView stagger={0.06}>
        {CATEGORIES.map((category) => (
          <motion.div key={category} className="category-column" variants={staggerItem}>
            <h3>{t(CATEGORY_LABEL_KEYS[category])}</h3>
            <ul>
              {catalog
                .filter((p) => p.category === category)
                .map((p) => (
                  <li key={p.id}>
                    <ProductIcon id={p.id} category={p.category} size="sm" />
                    <span>
                      {productName(p, language)}
                      {/* The other language's name helps vendors and search engines alike. */}
                      <span className="alt-name" lang={language === 'hi' ? 'en' : 'hi'}>
                        {p.name[language === 'hi' ? 'en' : 'hi']}
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
};

const Marquee = () => {
  const { language, t } = useLanguage();
  const items = catalog.filter((p) => p.category !== 'combo');
  const row = [...items, ...items];
  return (
    <div className="marquee" role="presentation" aria-label={t('marqueeLabel')}>
      <div className="marquee-track" aria-hidden="true">
        {/* Text with coloured dots (not icons) keeps the pre-rendered HTML light. */}
        {row.map((p, i) => (
          <span key={`${p.id}-${i}`} className={`marquee-item tone-${toneFor(p.category)}`}>
            {productName(p, language)}
          </span>
        ))}
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  // The connecting line draws itself as the section scrolls past.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section className="section how" id="how" ref={ref} aria-labelledby="how-title">
      <Reveal className="section-head">
        <p className="eyebrow-text">{t('howEyebrow')}</p>
        <h2 id="how-title" className="section-title">{t('howTitle')}</h2>
      </Reveal>
      <ol className="steps">
        <li className="steps-track" aria-hidden="true">
          <motion.span className="steps-fill steps-fill-y" style={{ scaleY: progress }} />
          <motion.span className="steps-fill steps-fill-x" style={{ scaleX: progress }} />
        </li>
        {STEPS.map((step, i) => (
          <Reveal as="li" key={step} className="step" delay={i * 0.12}>
            <span className="step-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h3>{t(`${step}Title`)}</h3>
            <p>{t(`${step}Body`)}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
};

const Areas = () => {
  const { t } = useLanguage();
  return (
    <section className="section areas" aria-labelledby="areas-title">
      <Reveal className="section-head">
        <p className="eyebrow-text">{t('areasEyebrow')}</p>
        <h2 id="areas-title" className="section-title">{t('areasTitle')}</h2>
        <p className="section-lead">{t('areasBody')}</p>
      </Reveal>
      <Stagger as="ul" className="area-list" inView stagger={0.04}>
        {servedAreas.map((area) => (
          <motion.li key={area} variants={staggerItem}>
            <FaMapMarkerAlt aria-hidden="true" /> {area}
          </motion.li>
        ))}
      </Stagger>
    </section>
  );
};

const Faq = () => {
  const { t } = useLanguage();
  return (
    <section className="section split" id="faq" aria-labelledby="faq-title">
      <Reveal className="split-head">
        <p className="eyebrow-text">{t('faqEyebrow')}</p>
        <h2 id="faq-title" className="section-title">{t('faqLandingTitle')}</h2>
      </Reveal>
      {/* <details> keeps every answer in the HTML, so search engines can read them. */}
      <Stagger className="faq-list" inView stagger={0.06}>
        {FAQ_NUMBERS.map((n) => (
          <motion.details key={n} className="faq" variants={staggerItem}>
            <summary>
              <span>{t(`faq${n}q`)}</span>
              <FaChevronDown className="faq-chevron" aria-hidden="true" />
            </summary>
            <p>{t(`faq${n}a`)}</p>
          </motion.details>
        ))}
      </Stagger>
    </section>
  );
};

const FinalCta = () => {
  const { t } = useLanguage();
  return (
    <section className="cta" aria-labelledby="cta-title">
      <Aurora variant="dark" />
      <Reveal className="cta-content">
        <h2 id="cta-title">{t('ctaTitle')}</h2>
        <p>{t('ctaBody')}</p>
        <Magnetic>
          <Link to="/auth?mode=register" className="btn btn-lg cta-btn" {...warmProps}>
            {t('getStarted')} <FaArrowRight aria-hidden="true" />
          </Link>
        </Magnetic>
      </Reveal>
    </section>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="landing-footer">
      <div className="footer-brand">
        <BrandMark />
        <p>{t('footerTagline')}</p>
      </div>
      <nav className="footer-col" aria-label={t('footerProduct')}>
        <h2>{t('footerProduct')}</h2>
        <a href="#features">{t('navFeatures')}</a>
        <a href="#how">{t('navHow')}</a>
        <a href="#faq">{t('navFaq')}</a>
      </nav>
      <nav className="footer-col" aria-label={t('footerAccount')}>
        <h2>{t('footerAccount')}</h2>
        <Link to="/auth?mode=register" {...warmProps}>{t('register')}</Link>
        <Link to="/auth" {...warmProps}>{t('login')}</Link>
      </nav>
      <div className="footer-col">
        <h2>{t('footerContact')}</h2>
        <a href={`tel:${SUPPORT_PHONE}`}>
          <FaPhoneAlt aria-hidden="true" /> {t('callSupport')}
        </a>
        <a href={`tel:${TOLL_FREE.replace(/-/g, '')}`}>{TOLL_FREE}</a>
      </div>
      <p className="footer-rights">{t('footerRights', { year: new Date().getFullYear() })}</p>
    </footer>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

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

  return (
    <div className="landing">
      <motion.div className="scroll-progress" style={{ scaleX: bar }} aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Marquee />
        <Categories />
        <HowItWorks />
        <Areas />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
