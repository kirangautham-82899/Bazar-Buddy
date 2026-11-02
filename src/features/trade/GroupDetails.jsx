import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { addReview, hasRequestedToJoin, requestToJoin, subscribeReviews } from '../../services/vendorService';
import vendorGroups from '../../data/vendorGroups';
import { findProduct } from '../../data/products';
import { deviationPct, fairPriceFor, isOverpriced } from '../../utils/pricing';
import { productName } from '../../utils/format';
import { FaExclamationTriangle } from 'react-icons/fa';
import ProductIcon from '../../components/common/ProductIcon';

const GroupDetails = ({ group, onClose, badges }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { reportError } = useShop();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [joined, setJoined] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!group) return undefined;
    setReviews([]);
    setJoined(false);
    setRating(5);
    setText('');
    hasRequestedToJoin(group.id, user.uid).then(setJoined).catch(() => {});
    return subscribeReviews(group.id, setReviews, reportError);
  }, [group, user.uid, reportError]);

  const average = useMemo(
    () => (reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null),
    [reviews]
  );

  if (!group) return <Modal open={false} title="" onClose={onClose} />;

  const handleJoin = async () => {
    try {
      await requestToJoin(group.id, user);
      setJoined(true);
      toast.show(t('joinSent', { group: group.name }));
    } catch (err) {
      reportError(err);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(group.id, user, rating, text);
      setText('');
      toast.show(t('feedbackThanks'));
    } catch (err) {
      reportError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title={group.name} onClose={onClose}>
      <div className="group-details">
        {badges}
        <p className="muted">
          {t('members', { n: group.members })} · {average ? t('rating', { r: average, n: reviews.length }) : t('noRatings')}
        </p>
        <p>{t('groupOffer', { offer: group.offer })}</p>

        <h3 className="group-subtitle">{t('stock')}</h3>
        <ul className="group-prices">
          {Object.entries(group.prices).map(([id, price]) => {
            const product = findProduct(id);
            const fair = fairPriceFor(id, vendorGroups, product.price);
            const inStock = group.stock[id];
            return (
              <li key={id}>
                <ProductIcon id={product.id} category={product.category} size="sm" />
                <span className="group-price-text">
                  <span>
                    {t('sells', { item: productName(product, language), price })}
                    <span className={`badge ${inStock ? 'badge-success' : 'badge-danger'}`}>
                      {inStock ? t('inStock') : t('outOfStock')}
                    </span>
                  </span>
                  {isOverpriced(price, fair) ? (
                    <span className="price-warning"><FaExclamationTriangle aria-hidden="true" /> {t('highPrice', { price, fair, pct: deviationPct(price, fair) })}</span>
                  ) : (
                    <span className="price-ok">✓ {t('fairPriceOk')}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <button type="button" className="btn btn-block" onClick={handleJoin} disabled={joined}>
          {joined ? `✓ ${t('joinRequested')}` : t('joinGroup')}
        </button>

        <form className="review-form" onSubmit={handleReview}>
          <h3 className="group-subtitle">{t('reviewFor', { group: group.name })}</h3>
          <div className="field">
            <label htmlFor="review-rating">{t('ratingLabel')}</label>
            <select id="review-rating" className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)} ({n})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="review-text" className="visually-hidden">{t('writeReview')}</label>
            <textarea
              id="review-text"
              className="input"
              rows={2}
              maxLength={300}
              placeholder={t('writeReview')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-block" disabled={submitting}>{t('submit')}</button>
        </form>

        {reviews.length > 0 && (
          <>
            <h3 className="group-subtitle">{t('recentReviews')}</h3>
            <ul className="review-list">
              {reviews.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <span aria-label={`${r.rating}/5`}>{'★'.repeat(r.rating)}</span>{' '}
                  <strong>{r.uid === user.uid ? t('you') : r.name || '—'}</strong>
                  {r.text && <p className="muted">{r.text}</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Modal>
  );
};

export default GroupDetails;
