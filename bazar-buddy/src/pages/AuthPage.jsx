import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { FaEnvelope, FaLock, FaPhone, FaUser } from 'react-icons/fa';
import Lottie from 'lottie-react';
import { auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { ensureUserProfile, updateUserProfile } from '../services/userService';
import { isValidEmail, normalizePhone, validateAuthForm } from '../utils/validation';
import welcomeAnim from '../assets/animations/welcome.json';
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

const Field = ({ icon: Icon, name, label, error, t, ...inputProps }) => (
  <div className="field">
    <label htmlFor={`auth-${name}`}>{label}</label>
    <div className="input-with-icon">
      <Icon aria-hidden="true" />
      <input
        id={`auth-${name}`}
        name={name}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `auth-${name}-error` : undefined}
        {...inputProps}
      />
    </div>
    {error && <span id={`auth-${name}-error`} className="field-error">{t(error)}</span>}
  </div>
);

const AuthPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    if (Object.keys(found).length) return;

    setSubmitting(true);
    const email = form.email.trim();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, form.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, form.password);
        const details = {
          name: form.name.trim(),
          phone: normalizePhone(form.phone),
          language,
        };
        await updateProfile(user, { displayName: details.name });
        await ensureUserProfile(user, details);
        // The auth listener may have created the profile first, so always write the details.
        await updateUserProfile(user.uid, details);
      }
      // PublicOnlyRoute redirects to the dashboard once the auth state updates.
    } catch (err) {
      setFormError(FIREBASE_ERRORS[err.code] || 'errGeneric');
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
      setFormError(FIREBASE_ERRORS[err.code] || 'errGeneric');
    }
  };

  const switchMode = () => {
    setIsLogin((v) => !v);
    setErrors({});
    setFormError('');
  };

  return (
    <main className="auth-page">
      <motion.section
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-lang" role="group" aria-label={t('languageLabel')}>
          {[['en', 'English'], ['hi', 'हिन्दी']].map(([code, label]) => (
            <button
              key={code}
              type="button"
              lang={code}
              className={`auth-lang-btn ${language === code ? 'active' : ''}`}
              aria-pressed={language === code}
              onClick={() => setLanguage(code)}
            >
              {label}
            </button>
          ))}
        </div>

        <Lottie animationData={welcomeAnim} loop className="auth-animation" aria-hidden="true" />

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'register'}
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="auth-title">{isLogin ? t('welcomeBack') : t('createAccount')}</h1>

            {!isLogin && (
              <Field icon={FaUser} name="name" label={t('name')} value={form.name} onChange={handleChange} error={errors.name} t={t} autoComplete="name" />
            )}
            <Field icon={FaEnvelope} name="email" type="email" label={t('email')} value={form.email} onChange={handleChange} error={errors.email} t={t} autoComplete="email" inputMode="email" />
            <Field icon={FaLock} name="password" type="password" label={t('password')} value={form.password} onChange={handleChange} error={errors.password} t={t} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            {!isLogin && (
              <Field icon={FaPhone} name="phone" type="tel" label={t('phone')} value={form.phone} onChange={handleChange} error={errors.phone} t={t} autoComplete="tel" inputMode="numeric" />
            )}

            {formError && <p className="auth-error" role="alert">{t(formError)}</p>}

            <button type="submit" className="btn btn-block" disabled={submitting}>
              {submitting ? t('loading') : isLogin ? t('login') : t('register')}
            </button>

            {isLogin && (
              <button type="button" className="btn btn-ghost btn-block" onClick={handleReset}>
                {t('forgot')}
              </button>
            )}

            <p className="auth-switch">
              {isLogin ? t('noAccount') : t('haveAccount')}{' '}
              <button type="button" className="link-btn" onClick={switchMode}>
                {isLogin ? t('register') : t('login')}
              </button>
            </p>
          </motion.form>
        </AnimatePresence>
      </motion.section>
    </main>
  );
};

export default AuthPage;
