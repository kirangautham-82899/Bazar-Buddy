import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { FaArrowLeft, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone, FaUser } from 'react-icons/fa';
import { auth } from '../../config/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ensureUserProfile, updateUserProfile } from '../../services/userService';
import { isValidEmail, normalizePhone, validateAuthForm } from '../../utils/validation';
import { catalog } from '../../data/products';
import BrandMark from '../../components/common/BrandMark';
import LanguageToggle from '../../components/common/LanguageToggle';
import ProductIcon from '../../components/common/ProductIcon';
import { Aurora } from '../../components/motion';
import { loadDashboardPage, loadHome, prefetchWhenIdle } from '../../routes/lazy';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import './AuthPage.css';

const FIREBASE_ERRORS = {
  'auth/invalid-credential': 'errWrongCredentials',
  'auth/wrong-password': 'errWrongCredentials',
  'auth/user-not-found': 'errWrongCredentials',
  'auth/invalid-email': 'errInvalidEmail',
  'auth/email-already-in-use': 'errEmailInUse',
  'auth/weak-password': 'errWeakPassword',
  'auth/too-many-requests': 'errTooMany',
  'auth/network-request-failed': 'errNetwork',
};

const BENEFITS = ['authBenefit1', 'authBenefit2', 'authBenefit3'];
const ORBIT = ['tomato', 'onion', 'potato', 'green-chilli', 'lemon', 'paneer'].map((id) => catalog.find((p) => p.id === id));

const Field = ({ icon: Icon, name, label, error, t, trailing, ...inputProps }) => (
  <div className="field">
    <label htmlFor={`auth-${name}`}>{label}</label>
    <div className="input-with-icon">
      <Icon className="input-icon" aria-hidden="true" />
      <input
        id={`auth-${name}`}
        name={name}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `auth-${name}-error` : undefined}
        {...inputProps}
      />
      {trailing}
    </div>
    <AnimatePresence>
      {error && (
        <motion.span
          id={`auth-${name}-error`}
          className="field-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {t(error)}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
);

// Fields that only exist when registering slide open and closed.
const Collapsible = ({ show, children }) => (
  <AnimatePresence initial={false}>
    {show && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const BrandPanel = () => {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % BENEFITS.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="auth-panel">
      <Aurora variant="dark" />
      <div className="auth-panel-content">
        <Link to="/" className="auth-panel-brand">
          <BrandMark light />
        </Link>

        <div className="auth-orbit" aria-hidden="true">
          <span className="orbit-ring" />
          <span className="orbit-ring orbit-ring-2" />
          {ORBIT.map((p, i) => (
            <span key={p.id} className="orbit-item" style={{ '--i': i, '--n': ORBIT.length }}>
              <span className="orbit-counter">
                <ProductIcon id={p.id} category={p.category} size="md" />
              </span>
            </span>
          ))}
        </div>

        <h2 className="auth-panel-title">{t('authPanelTitle')}</h2>
        <div className="auth-benefit" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={BENEFITS[index]}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              transition={{ duration: 0.45 }}
            >
              {t(BENEFITS[index])}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="auth-dots" aria-hidden="true">
          {BENEFITS.map((b, i) => (
            <span key={b} className={i === index ? 'active' : ''} />
          ))}
        </div>
      </div>
    </aside>
  );
};

const AuthPage = () => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const isLogin = params.get('mode') !== 'register';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [errorKey, setErrorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useDocumentMeta({ title: `${isLogin ? t('login') : t('register')} – ${t('appName')}`, noindex: true });

  // While the vendor types, fetch the dashboard so it opens instantly after login.
  useEffect(() => prefetchWhenIdle(loadDashboardPage, loadHome), []);

  const setMode = (mode) => {
    setParams(mode === 'register' ? { mode } : {}, { replace: true });
    setErrors({});
    setFormError('');
  };

  const fail = (key) => {
    setFormError(key);
    setErrorKey((k) => k + 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateAuthForm(form, isLogin);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) {
      setErrorKey((k) => k + 1);
      return;
    }

    setSubmitting(true);
    const email = form.email.trim();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, form.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, form.password);
        const details = { name: form.name.trim(), phone: normalizePhone(form.phone), language };
        await updateProfile(user, { displayName: details.name });
        await ensureUserProfile(user, details);
        // The auth listener may have created the profile first, so always write the details.
        await updateUserProfile(user.uid, details);
      }
      // PublicOnlyRoute redirects to the dashboard once the auth state updates.
    } catch (err) {
      fail(FIREBASE_ERRORS[err.code] || 'errGeneric');
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    const email = form.email.trim();
    if (!isValidEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'errEmailFirst' }));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.show(t('resetSent', { email }));
    } catch (err) {
      fail(FIREBASE_ERRORS[err.code] || 'errGeneric');
    }
  };

  return (
    <div className="auth-page">
      <BrandPanel />

      <main className="auth-main">
        <div className="auth-topbar">
          <Link to="/" className="btn btn-sm btn-ghost">
            <FaArrowLeft aria-hidden="true" /> {t('backHome')}
          </Link>
          <LanguageToggle short />
        </div>

        <motion.section
          className="auth-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-mobile-brand">
            <BrandMark />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-head' : 'register-head'}
              initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="auth-title">{isLogin ? t('welcomeBack') : t('createAccount')}</h1>
              <p className="muted auth-subtitle">{isLogin ? t('loginSubtitle') : t('registerSubtitle')}</p>
            </motion.div>
          </AnimatePresence>

          <div className="segmented auth-tabs" role="tablist" aria-label={t('authModeLabel')}>
            {[
              ['login', t('login')],
              ['register', t('register')],
            ].map(([mode, label]) => {
              const active = (mode === 'login') === isLogin;
              return (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`segmented-btn ${active ? 'active' : ''}`}
                  onClick={() => setMode(mode)}
                >
                  {active && <motion.span layoutId="auth-tab-pill" className="segmented-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                  {label}
                </button>
              );
            })}
          </div>

          <motion.form
            onSubmit={handleSubmit}
            noValidate
            key={errorKey}
            animate={errorKey ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
            transition={{ duration: 0.4 }}
          >
            <Collapsible show={!isLogin}>
              <Field icon={FaUser} name="name" label={t('name')} value={form.name} onChange={handleChange} error={errors.name} t={t} autoComplete="name" />
            </Collapsible>
            <Field icon={FaEnvelope} name="email" type="email" label={t('email')} value={form.email} onChange={handleChange} error={errors.email} t={t} autoComplete="email" inputMode="email" />
            <Field
              icon={FaLock}
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={t('password')}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              t={t}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              trailing={
                <button
                  type="button"
                  className="input-trailing"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                </button>
              }
            />
            <Collapsible show={!isLogin}>
              <Field icon={FaPhone} name="phone" type="tel" label={t('phone')} value={form.phone} onChange={handleChange} error={errors.phone} t={t} autoComplete="tel" inputMode="numeric" />
            </Collapsible>

            <AnimatePresence>
              {formError && (
                <motion.p className="auth-error" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  {t(formError)}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="btn btn-lg btn-block" disabled={submitting}>
              {submitting ? <span className="btn-spinner" aria-hidden="true" /> : null}
              {submitting ? t('loading') : isLogin ? t('login') : t('register')}
            </button>

            {isLogin && (
              <button type="button" className="btn btn-ghost btn-block auth-forgot" onClick={handleReset}>
                {t('forgot')}
              </button>
            )}
          </motion.form>
        </motion.section>
      </main>
    </div>
  );
};

export default AuthPage;
