import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaExchangeAlt, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { addBarter, deleteBarter, subscribeBarters } from '../../services/vendorService';

// Live board shared by all signed-in vendors.
const BarterBoard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { reportError } = useShop();
  const toast = useToast();
  const [barters, setBarters] = useState([]);
  const [offer, setOffer] = useState('');
  const [request, setRequest] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => subscribeBarters(setBarters, reportError), [reportError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offer.trim() || !request.trim()) return;
    setPosting(true);
    try {
      await addBarter(user, offer, request);
      setOffer('');
      setRequest('');
      toast.show(t('barterPosted'));
    } catch (err) {
      reportError(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="card barter" aria-labelledby="barter-title">
      <h2 id="barter-title" className="card-title">
        <span className="card-title-icon"><FaExchangeAlt aria-hidden="true" /></span>
        {t('barter')}
      </h2>
      <p className="muted">{t('barterDesc')}</p>

      <form className="barter-form" onSubmit={handleSubmit}>
        <label htmlFor="barter-offer" className="visually-hidden">{t('offerItem')}</label>
        <input id="barter-offer" className="input" placeholder={t('offerItem')} value={offer} maxLength={80} onChange={(e) => setOffer(e.target.value)} required />
        <label htmlFor="barter-request" className="visually-hidden">{t('requestItem')}</label>
        <input id="barter-request" className="input" placeholder={t('requestItem')} value={request} maxLength={80} onChange={(e) => setRequest(e.target.value)} required />
        <motion.button whileTap={{ scale: 0.96 }} type="submit" className="btn" disabled={posting}>
          <FaPaperPlane aria-hidden="true" /> {t('postBarter')}
        </motion.button>
      </form>

      {barters.length === 0 ? (
        <p className="empty-state">{t('noBarters')}</p>
      ) : (
        <motion.ul layout className="barter-list">
          <AnimatePresence initial={false}>
            {barters.map((b) => (
              <motion.li
                key={b.id}
                layout
                className="barter-entry"
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              >
                <span className="barter-swap">
                  <span className="barter-chip">{b.offer}</span>
                  <FaExchangeAlt className="barter-arrow" aria-label="↔" />
                  <span className="barter-chip barter-chip-want">{b.request}</span>
                  <span className="muted barter-by">{b.uid === user.uid ? t('you') : b.name || '—'}</span>
                </span>
                {b.uid === user.uid && (
                  <button type="button" className="icon-btn icon-btn-danger" onClick={() => deleteBarter(b.id).catch(reportError)} aria-label={t('delete')}>
                    <FaTrash aria-hidden="true" />
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
};

export default BarterBoard;
