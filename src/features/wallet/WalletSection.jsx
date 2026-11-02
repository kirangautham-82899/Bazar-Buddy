import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { redeemFreeDelivery, subscribeRedemptions } from '../../services/userService';
import { COINS_FOR_FREE_DELIVERY } from '../../config/app';
import { toDate } from '../../utils/orderStatus';
import { formatDate, formatRupees, shortId } from '../../utils/format';
import './WalletSection.css';

const WalletSection = () => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const { orders, reportError } = useShop();
  const toast = useToast();
  const [redemptions, setRedemptions] = useState([]);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => subscribeRedemptions(user.uid, setRedemptions, reportError), [user.uid, reportError]);

  const coins = profile?.coins || 0;
  const credits = profile?.freeDeliveryCredits || 0;
  const payments = useMemo(() => orders.filter((o) => o.status !== 'cancelled'), [orders]);

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      await redeemFreeDelivery(user.uid);
      toast.show(t('redeemed'));
    } catch (err) {
      if (err.message === 'not-enough-coins') toast.show(t('notEnoughCoins'), 'error');
      else reportError(err);
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="page-title">{t('wallet')}</h1>

      <div className="grid grid-2">
        <section className="card wallet-card wallet-coins" aria-labelledby="w-coins">
          <h2 id="w-coins" className="card-title">💰 {t('apnaCoins')}</h2>
          <p className="wallet-big">{t('coinsBalance', { n: coins })}</p>
          <p className="muted">{t('coinsRule')}</p>
        </section>

        <section className="card wallet-card wallet-savings" aria-labelledby="w-savings">
          <h2 id="w-savings" className="card-title">🎯 {t('savings')}</h2>
          <p className="wallet-big">{t('savedAmount', { n: profile?.savings || 0 })}</p>
          <p className="muted">{t('savingsHint')}</p>
        </section>

        <section className="card wallet-card" aria-labelledby="w-redeem">
          <h2 id="w-redeem" className="card-title">🎁 {t('redeemArea')}</h2>
          <p>{t('redeemDesc')}</p>
          {credits > 0 && <p className="badge badge-success">{t('freeDeliveries', { n: credits })}</p>}
          <button
            type="button"
            className="btn btn-block wallet-redeem"
            disabled={coins < COINS_FOR_FREE_DELIVERY || redeeming}
            onClick={handleRedeem}
          >
            {t('redeemNow')}
          </button>
          {coins < COINS_FOR_FREE_DELIVERY && (
            <p className="muted small">{t('coinsToGo', { n: COINS_FOR_FREE_DELIVERY - coins })}</p>
          )}
        </section>

        <section className="card wallet-card" aria-labelledby="w-history">
          <h2 id="w-history" className="card-title">🎉 {t('redeemHistory')}</h2>
          {redemptions.length ? (
            <ul className="wallet-list">
              {redemptions.map((r) => (
                <li key={r.id}>
                  <span>{t('rewardFreeDelivery')}</span>
                  <span className="muted">−{r.coins} · {formatDate(toDate(r.createdAt), language)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">{t('noRedemptions')}</p>
          )}
        </section>
      </div>

      <section className="card wallet-card wallet-full" aria-labelledby="w-tx">
        <h2 id="w-tx" className="card-title">📜 {t('transactions')}</h2>
        {payments.length ? (
          <ul className="wallet-list">
            {payments.map((o) => (
              <li key={o.id}>
                <span>
                  <strong>{t('orderNo', { id: shortId(o.id) })}</strong>
                  <span className="muted"> · {o.payment === 'upi' ? t('upi') : t('cod')}</span>
                </span>
                <span>
                  {formatRupees(o.total)} <span className="muted">· {formatDate(toDate(o.createdAt), language)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{t('noTransactions')}</p>
        )}
      </section>
    </motion.div>
  );
};

export default WalletSection;
