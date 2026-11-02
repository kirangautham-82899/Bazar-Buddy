import React, { useState } from 'react';
import { t } from '../../content/strings';
import { useToast } from '../../context/ToastContext';
import CATEGORIES, { UNITS } from '../../data/categories';
import { deleteProduct, saveProduct } from '../../services/catalogService';
import ProductIcon, { ICON_KEYS } from '../../components/common/ProductIcon';

export const validateProduct = ({ name, price, mrp, stock }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'errRequired';
  if (!(Number(price) > 0)) errors.price = 'errPrice';
  if (mrp !== '' && mrp !== null && Number(mrp) < Number(price)) errors.mrp = 'errMrp';
  if (stock === '' || Number(stock) < 0) errors.stock = 'errStock';
  return errors;
};

const EMPTY = { name: '', category: CATEGORIES[0].id, unit: 'kg', price: '', mrp: '', stock: '', active: true, icon: '', keywords: '', description: '', sortOrder: '' };

// Add or edit one product. Saves straight to Firestore; the shop updates live.
const ProductForm = ({ product, onDone }) => {
  const toast = useToast();
  const [form, setForm] = useState(() =>
    product ? { ...EMPTY, ...product, mrp: product.mrp ?? '', keywords: (product.keywords || []).join(', ') } : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    setErrors({ ...errors, [key]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateProduct(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await saveProduct({ ...form, keywords: form.keywords.split(',') });
      toast.show(t('productSaved'));
      onDone();
    } catch (err) {
      console.error(err);
      toast.show(t('errGeneric'), 'error');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('deleteConfirm', { item: product.name }))) return;
    try {
      await deleteProduct(product.id);
      toast.show(t('productDeleted'), 'info');
      onDone();
    } catch (err) {
      console.error(err);
      toast.show(t('errGeneric'), 'error');
    }
  };

  const field = (key, label, input) => (
    <div className={`field field-${key}`}>
      <label htmlFor={`product-${key}`}>{t(label)}</label>
      {input}
      {errors[key] && <span className="field-error">{t(errors[key])}</span>}
    </div>
  );

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      {field('name', 'productName', <input id="product-name" className="input" value={form.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} />)}
      {field('category', 'category', (
        <select id="product-category" className="input" value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{t(c.labelKey)}</option>)}
        </select>
      ))}
      {field('unit', 'unit', (
        <select id="product-unit" className="input" value={form.unit} onChange={set('unit')}>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      ))}
      {field('price', 'price', <input id="product-price" className="input" type="number" min="0" step="0.5" inputMode="decimal" value={form.price} onChange={set('price')} aria-invalid={Boolean(errors.price)} />)}
      {field('mrp', 'mrp', <input id="product-mrp" className="input" type="number" min="0" step="0.5" inputMode="decimal" value={form.mrp} onChange={set('mrp')} aria-invalid={Boolean(errors.mrp)} />)}
      {field('stock', 'stock', <input id="product-stock" className="input" type="number" min="0" step="1" inputMode="numeric" value={form.stock} onChange={set('stock')} aria-invalid={Boolean(errors.stock)} />)}
      {field('sortOrder', 'sortOrder', <input id="product-sortOrder" className="input" type="number" inputMode="numeric" value={form.sortOrder} onChange={set('sortOrder')} />)}
      {field('keywords', 'keywords', <input id="product-keywords" className="input" value={form.keywords} onChange={set('keywords')} placeholder="pyaz, kanda" />)}
      {field('description', 'description', <textarea id="product-description" className="input" rows={2} maxLength={300} value={form.description} onChange={set('description')} />)}

      <fieldset className="icon-picker">
        <legend>{t('icon')}</legend>
        <div className="icon-picker-grid">
          {ICON_KEYS.map((key) => (
            <label key={key} className={`icon-option ${form.icon === key ? 'selected' : ''}`} title={key}>
              <input type="radio" name="product-icon" value={key} checked={form.icon === key} onChange={set('icon')} className="visually-hidden" />
              <ProductIcon icon={key} category={form.category} size="sm" />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="choice product-active">
        <input type="checkbox" checked={form.active} onChange={set('active')} />
        <span className="choice-text">{t('active')}</span>
      </label>

      <div className="product-form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving && <span className="btn-spinner" aria-hidden="true" />}
          {t('save')}
        </button>
        {product && (
          <button type="button" className="btn btn-danger" onClick={handleDelete}>{t('delete')}</button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
