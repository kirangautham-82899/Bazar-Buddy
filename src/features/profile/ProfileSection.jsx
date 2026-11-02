import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { signOut, updateProfile } from 'firebase/auth';
import { FaEnvelope, FaPen, FaPhone, FaQuestionCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/userService';
import { normalizePhone, validateProfileFields } from '../../utils/validation';
import { LANGUAGE_OPTIONS } from '../../i18n/translations';
import './ProfileSection.css';

const ProfileSection = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, profile } = useAuth();
  const { reportError } = useShop();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setForm({ name: profile?.name || user.displayName || '', phone: profile?.phone || '' });
    setErrors({});
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const found = validateProfileFields(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const fields = { name: form.name.trim(), phone: normalizePhone(form.phone) };
      await Promise.all([updateUserProfile(user.uid, fields), updateProfile(user, { displayName: fields.name })]);
      toast.show(t('profileSaved'));
      setEditing(false);
    } catch (err) {
      reportError(err);
    } finally {
      setSaving(false);
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    updateUserProfile(user.uid, { language: lang }).catch(() => {});
  };

  const initial = (profile?.name || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="page profile-page">
      <section className="card profile-card">
        <div className="profile-cover" aria-hidden="true" />
        <motion.div
          className="profile-avatar"
          aria-hidden="true"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          {initial}
        </motion.div>
        <div className="profile-identity">
          <h1 className="page-title">{profile?.name || user.displayName || t('profile')}</h1>
          <p className="muted">{user.email}</p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.form key="edit" onSubmit={handleSave} noValidate initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="field">
              <label htmlFor="profile-name">{t('name')}</label>
              <input id="profile-name" className="input" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              {errors.name && <span className="field-error">{t(errors.name)}</span>}
            </div>
            <div className="field">
              <label htmlFor="profile-phone">{t('phone')}</label>
              <input id="profile-phone" type="tel" inputMode="numeric" className="input" value={form.phone} aria-invalid={Boolean(errors.phone)} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
              {errors.phone && <span className="field-error">{t(errors.phone)}</span>}
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn" disabled={saving}>{t('save')}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>{t('cancel')}</button>
            </div>
          </motion.form>
        ) : (
          <motion.div key="view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <dl className="profile-details">
              <div><dt><FaUser aria-hidden="true" /> {t('name')}</dt><dd>{profile?.name || user.displayName || t('notSet')}</dd></div>
              <div><dt><FaEnvelope aria-hidden="true" /> {t('email')}</dt><dd>{user.email}</dd></div>
              <div><dt><FaPhone aria-hidden="true" /> {t('phone')}</dt><dd>{profile?.phone || t('notSet')}</dd></div>
            </dl>
            <button type="button" className="btn btn-secondary btn-block" onClick={startEditing}>
              <FaPen aria-hidden="true" /> {t('editProfile')}
            </button>
          </motion.div>
        )}
        </AnimatePresence>

        <fieldset className="choice-group choice-row profile-language">
          <legend>{t('languageLabel')}</legend>
          {LANGUAGE_OPTIONS.map(({ code, label }) => (
            <label key={code} className="choice" lang={code}>
              <input type="radio" name="profile-language" checked={language === code} onChange={() => changeLanguage(code)} />
              <span className="choice-text">{label}</span>
            </label>
          ))}
        </fieldset>

        <Link to="/dashboard/help" className="btn btn-ghost btn-block">
          <FaQuestionCircle aria-hidden="true" /> {t('navHelp')}
        </Link>
        <button type="button" className="btn btn-danger btn-block" onClick={() => signOut(auth)}>
          <FaSignOutAlt aria-hidden="true" /> {t('logout')}
        </button>
      </section>
    </div>
  );
};

export default ProfileSection;
