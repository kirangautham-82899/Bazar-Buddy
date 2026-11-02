import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCoins, FaGift, FaHistory, FaPiggyBank, FaReceipt, FaTruck } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { redeemFreeDelivery, subscribeRedemptions } from '../../services/userService';
import { COINS_FOR_FREE_DELIVERY } from '../../config/app';
import { toDate } from '../../utils/orderStatus';
import { formatDate, formatRupees, shortId } from '../../utils/format';
import { AnimatedNumber, Confetti, Stagger, staggerItem } from '../../components/motion';
import './WalletSection.css';

const WalletSection = () => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const { orders, reportError } = useShop();
  const toast = useToast();
  const [redemptions, setRedemptions] = useState([]);
  const [redeeming, setRedeeming] = useState(false);
  const [celebrate, setCelebrate] = useState(0);

  useEffect(() => subscribeRedemptions(user.uid, setRedemptions, reportError), [user.uid, reportError]);

  const coins = profile?.coins || 0;
  const credits = profile?.freeDeliveryCredits || 0;
  const payments = useMemo(() => orders.filter((o) => o.status !== 'cancelled'), [orders]);
  const progress = Math.min(coins / COINS_FOR_FREE_DELIVERY, 1);

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      await redeemFreeDelivery(user.uid);
      setCelebrate((n) => n + 1);
      toast.show(t('redeemed'));
    } catch (err) {
      if (err.message === 'not-enough-coins') toast.show(t('notEnoughCoins'), 'error');
      else reportError(err);
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('wallet')}</h1>
        <p className="page-subtitle">{t('coinsRule')}</p>
      </header>

      <Stagger className="wallet-top">
        <motion.section className="wallet-hero" variants={staggerItem} aria-labelledby="w-coins">
          <span className="wallet-hero-icon" aria-hidden="true"><FaCoins /></span>
          <h2 id="w-coins" className="wallet-hero-label">{t('apnaCoins')}</h2>
          <p className="wallet-hero-value">
            <AnimatedNumber value={coins} />
          </p>
          <div className="wallet-meter" aria-hidden="true">
            <motion.span
              className="wallet-meter-fill"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </div>
          <p className="wallet-hero-hint">
            {coins < COINS_FOR_FREE_DELIVERY ? t('coinsToGo', { n: COINS_FOR_FREE_DELIVERY - coins }) : t('coinsReady')}
          </p>
        </motion.section>

        <motion.section className="card wallet-stat" variants={staggerItem} aria-labelledby="w-savings">
          <span className="wallet-stat-icon tone-green-bg" aria-hidden="true"><FaPiggyBank /></span>
          <h2 id="w-savings" className="wallet-stat-label">{t('savings')}</h2>
          <p className="wallet-stat-value">
            <AnimatedNumber value={profile?.savings || 0} format={(n) => formatRupees(Math.round(n))} />
          </p>
          <p className="muted small">{t('savingsHint')}</p>
        </motion.section>

        <motion.section className="card wallet-stat" variants={staggerItem} aria-labelledby="w-credits">
          <span className="wallet-stat-icon tone-violet-bg" aria-hidden="true"><FaTruck /></span>
          <h2 id="w-credits" className="wallet-stat-label">{t('rewardFreeDelivery')}</h2>
          <p className="wallet-stat-value">
            <AnimatedNumber value={credits} />
          </p>
          <p className="muted small">{t('freeDeliveries', { n: credits })}</p>
        </motion.section>
      </Stagger>

      <div className="grid grid-2 wallet-grid">
        <section className="card wallet-redeem" aria-labelledby="w-redeem">
          <AnimatePresence>{celebrate > 0 && <Confetti key={celebrate} />}</AnimatePresence>
          <h2 id="w-redeem" className="card-title">
            <span className="card-title-icon"><FaGift aria-hidden="true" /></span>
            {t('redeemArea')}
          </h2>
          <p>{t('redeemDesc')}</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            className="btn btn-block"
            disabled={coins < COINS_FOR_FREE_DELIVERY || redeeming}
            onClick={handleRedeem}
          >
            {redeeming && <span className="btn-spinner" aria-hidden="true" />}
            {t('redeemNow')}
          </motion.button>
        </section>

        <section className="card" aria-labelledby="w-history">
          <h2 id="w-history" className="card-title">
            <span className="card-title-icon"><FaHistory aria-hidden="true" /></span>
            {t('redeemHistory')}
          </h2>
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

      <section className="card wallet-full" aria-labelledby="w-tx">
        <h2 id="w-tx" className="card-title">
          <span className="card-title-icon"><FaReceipt aria-hidden="true" /></span>
          {t('transactions')}
        </h2>
        {payments.length ? (
          <Stagger as="ul" className="wallet-list" stagger={0.04}>
            {payments.map((o) => (
              <motion.li key={o.id} variants={staggerItem}>
                <span>
                  <strong>{t('orderNo', { id: shortId(o.id) })}</strong>
                  <span className="muted"> · {o.payment === 'upi' ? t('upi') : t('cod')}</span>
                </span>
                <span>
                  <strong>{formatRupees(o.total)}</strong> <span className="muted">· {formatDate(toDate(o.createdAt), language)}</span>
                </span>
              </motion.li>
            ))}
          </Stagger>
        ) : (
          <p className="empty-state">{t('noTransactions')}</p>
        )}
      </section>
    </div>
  );
};

export default WalletSection;
