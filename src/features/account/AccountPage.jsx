import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signOut, updateProfile } from 'firebase/auth';
import { FaChevronDown, FaChevronRight, FaEnvelope, FaHeadset, FaMapMarkerAlt, FaPen, FaPhone, FaSignOutAlt, FaUser, FaUserShield } from 'react-icons/fa';
import { auth } from '../../config/firebase';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { updateUserProfile } from '../../services/userService';
import { SUPPORT_PHONE, TOLL_FREE } from '../../config/app';
import { formatAddress } from '../../utils/format';
import { normalizePhone, validateProfileFields } from '../../utils/validation';
import Modal from '../../components/common/Modal';
import AddressForm from '../cart/AddressForm';
import './account.css';

const FAQ = [1, 2, 3, 4, 5];

const ProfileForm = ({ onDone }) => {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: profile?.name || user.displayName || '', phone: profile?.phone || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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
      onDone();
    } catch (err) {
      console.error(err);
      toast.show(t('errGeneric'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} noValidate>
      {[['name', 'name', 'name'], ['phone', 'phone', 'tel']].map(([key, label, autoComplete]) => (
        <div key={key} className="field">
          <label htmlFor={`profile-${key}`}>{t(label)}</label>
          <input id={`profile-${key}`} className="input" value={form[key]} autoComplete={autoComplete} aria-invalid={Boolean(errors[key])} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          {errors[key] && <span className="field-error">{t(errors[key])}</span>}
        </div>
      ))}
      <button type="submit" className="btn btn-block" disabled={saving}>{t('save')}</button>
    </form>
  );
};

const AccountPage = () => {
  const { user, profile, isAdmin } = useAuth();
  const { hash } = useLocation();
  const [editing, setEditing] = useState(null); // 'profile' | 'address' | null
  useDocumentMeta({ title: `${t('account')} – ${t('appName')}`, noindex: true });

  // The header's address chip links here with #address.
  useEffect(() => {
    if (hash === '#address') setEditing('address');
  }, [hash]);

  const name = profile?.name || user.displayName || '';
  const address = profile?.address;

  return (
    <div className="page account-page">
      <motion.section className="account-hero" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className="account-avatar" aria-hidden="true">{(name || user.email || '?').charAt(0).toUpperCase()}</span>
        <div>
          <h1>{name || t('account')}</h1>
          <p>{user.email}</p>
        </div>
      </motion.section>

      <section className="account-list">
        <button type="button" className="account-row" onClick={() => setEditing('profile')}>
          <FaUser aria-hidden="true" />
          <span>
            <strong>{name || t('notSet')}</strong>
            <small><FaPhone aria-hidden="true" /> {profile?.phone || t('notSet')} · <FaEnvelope aria-hidden="true" /> {user.email}</small>
          </span>
          <FaPen aria-hidden="true" className="account-row-end" />
        </button>
        <button type="button" className="account-row" id="address" onClick={() => setEditing('address')}>
          <FaMapMarkerAlt aria-hidden="true" />
          <span>
            <strong>{t('deliveryAddress')}</strong>
            <small>{address ? formatAddress(address) : t('setAddress')}</small>
          </span>
          <FaPen aria-hidden="true" className="account-row-end" />
        </button>
        {isAdmin && (
          <Link to="/admin" className="account-row">
            <FaUserShield aria-hidden="true" />
            <span><strong>{t('adminPanel')}</strong></span>
            <FaChevronRight aria-hidden="true" className="account-row-end" />
          </Link>
        )}
        <a href={`tel:${SUPPORT_PHONE}`} className="account-row">
          <FaHeadset aria-hidden="true" />
          <span>
            <strong>{t('callSupport')}</strong>
            <small>{t('tollFree')}: {TOLL_FREE}</small>
          </span>
          <FaChevronRight aria-hidden="true" className="account-row-end" />
        </a>
      </section>

      <section className="account-faq" aria-labelledby="faq-title">
        <h2 id="faq-title">{t('faqTitle')}</h2>
        {FAQ.map((n) => (
          <details key={n} className="faq">
            <summary>
              <span>{t(`faq${n}q`)}</span>
              <FaChevronDown className="faq-chevron" aria-hidden="true" />
            </summary>
            <p>{t(`faq${n}a`)}</p>
          </details>
        ))}
      </section>

      <button type="button" className="btn btn-danger btn-block" onClick={() => signOut(auth)}>
        <FaSignOutAlt aria-hidden="true" /> {t('logout')}
      </button>

      <Modal open={editing === 'profile'} title={t('editProfile')} onClose={() => setEditing(null)}>
        <ProfileForm onDone={() => setEditing(null)} />
      </Modal>
      <Modal open={editing === 'address'} title={t('deliveryAddress')} onClose={() => setEditing(null)}>
        <AddressForm onSaved={() => setEditing(null)} />
      </Modal>
    </div>
  );
};

export default AccountPage;
