import React, { useState } from 'react';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { saveAddress } from '../../services/userService';
import { validateAddress } from '../../utils/validation';

const FIELDS = [
  { name: 'name', label: 'addressName', autoComplete: 'organization' },
  { name: 'phone', label: 'phone', autoComplete: 'tel', type: 'tel', inputMode: 'numeric' },
  { name: 'line1', label: 'addressLine', autoComplete: 'address-line1' },
  { name: 'area', label: 'addressArea', autoComplete: 'address-line2' },
  { name: 'city', label: 'addressCity', autoComplete: 'address-level2' },
  { name: 'pincode', label: 'addressPincode', autoComplete: 'postal-code', inputMode: 'numeric' },
];

// Delivery address editor, used at checkout and in Account.
const AddressForm = ({ onSaved }) => {
  const { user, profile } = useAuth();
  const toast = useToast();
  const saved = profile?.address || {};
  const [form, setForm] = useState({
    name: saved.name || profile?.name || '',
    phone: saved.phone || profile?.phone || '',
    line1: saved.line1 || '',
    area: saved.area || '',
    city: saved.city || '',
    pincode: saved.pincode || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateAddress(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await saveAddress(user.uid, form);
      toast.show(t('addressSaved'));
      onSaved?.();
    } catch (err) {
      console.error(err);
      toast.show(t('errGeneric'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="address-form" onSubmit={handleSubmit} noValidate>
      {FIELDS.map(({ name, label, ...input }) => (
        <div key={name} className={`field field-${name}`}>
          <label htmlFor={`address-${name}`}>{t(label)}</label>
          <input
            id={`address-${name}`}
            className="input"
            value={form[name]}
            aria-invalid={Boolean(errors[name])}
            onChange={(e) => {
              setForm({ ...form, [name]: e.target.value });
              setErrors({ ...errors, [name]: undefined });
            }}
            {...input}
          />
          {errors[name] && <span className="field-error">{t(errors[name])}</span>}
        </div>
      ))}
      <button type="submit" className="btn btn-block" disabled={saving}>
        {saving && <span className="btn-spinner" aria-hidden="true" />}
        {t('save')}
      </button>
    </form>
  );
};

export default AddressForm;
