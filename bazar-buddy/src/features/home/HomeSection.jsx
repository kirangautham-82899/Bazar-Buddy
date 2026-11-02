import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { useNow } from '../../hooks/useNow';
import { combos } from '../../data/products';
import { COINS_FOR_FREE_DELIVERY } from '../../config/app';
import { getOrderStage, isActiveStage, recentPurchases } from '../../utils/orderStatus';
import { formatRupees, productName } from '../../utils/format';
import OrderList from '../market/OrderList';
import reorderAnim from '../../assets/animations/reorder.json';
import offerAnim from '../../assets/animations/offer.json';
import './HomeSection.css';

const card = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const HomeSection = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { orders, ordersLoading, addToCart } = useShop();
  const toast = useToast();
  const now = useNow();

  const reorderList = useMemo(() => recentPurchases(orders), [orders]);
  const activeOrders = useMemo(() => orders.filter((o) => isActiveStage(getOrderStage(o, now))), [orders, now]);
  const coins = profile?.coins || 0;
  const coinsToGo = Math.max(0, COINS_FOR_FREE_DELIVERY - coins);

  const handleAdd = async (product, quantity = 1) => {
    await addToCart(product.id, quantity);
    toast.show(t('reorderAdded', { item: productName(product, language) }));
  };

  return (
    <div className="page home-page">
      <h1 className="home-greeting">
        {profile?.name ? t('greeting', { name: profile.name.split(' ')[0] }) : t('greetingFallback')} 👋
      </h1>

      <div className="grid grid-2">
        <motion.section className="card home-card" {...card} aria-labelledby="reorder-title">
          <div className="home-card-head">
            <Lottie animationData={reorderAnim} className="home-lottie" aria-hidden="true" />
            <h2 id="reorder-title" className="card-title">{t('quickReorder')}</h2>
          </div>
          {reorderList.length ? (
            <ul className="home-list">
              {reorderList.map(({ product, quantity }) => (
                <li key={product.id} className="home-list-row">
                  <span>
                    {product.emoji} {productName(product, language)}
                    <span className="muted"> · {quantity} {product.unit}</span>
                  </span>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleAdd(product, quantity)}>
                    {t('reorder')}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>{t('noPastOrders')}</p>
              <Link to="/dashboard/market" className="btn btn-sm">{t('shopNow')}</Link>
            </div>
          )}
        </motion.section>

        <motion.section className="card home-card coins-card" {...card} aria-labelledby="coins-title">
          <h2 id="coins-title" className="card-title">💰 {t('apnaCoins')}</h2>
          <p className="coins-value">{coins}</p>
          <progress className="coins-progress" value={Math.min(coins, COINS_FOR_FREE_DELIVERY)} max={COINS_FOR_FREE_DELIVERY} aria-label={t('apnaCoins')} />
          <p className="muted">{coinsToGo ? t('coinsToGo', { n: coinsToGo }) : t('coinsReady')}</p>
          <Link to="/dashboard/wallet" className="btn btn-sm btn-secondary">{t('goToWallet')}</Link>
        </motion.section>

        <motion.section className="card home-card" {...card} aria-labelledby="offers-title">
          <div className="home-card-head">
            <Lottie animationData={offerAnim} className="home-lottie" aria-hidden="true" />
            <h2 id="offers-title" className="card-title">{t('offers')}</h2>
          </div>
          <ul className="home-list">
            {combos.map((combo) => (
              <li key={combo.id} className="home-list-row">
                <span>
                  {combo.emoji} {productName(combo, language)}
                  <span className="home-price">
                    <strong>{formatRupees(combo.price)}</strong> <s className="muted">{formatRupees(combo.mrp)}</s>
                  </span>
                </span>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleAdd(combo)}>
                  {t('addCombo')}
                </button>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section className="card home-card" {...card} aria-labelledby="active-title">
          <div className="home-card-head home-card-head-split">
            <h2 id="active-title" className="card-title">📦 {t('activeOrders')}</h2>
            {orders.length > 0 && <Link to="/dashboard/market#orders" className="btn btn-ghost btn-sm">{t('viewAll')}</Link>}
          </div>
          <OrderList orders={activeOrders.slice(0, 3)} loading={ordersLoading} compact emptyText={t('noActiveOrders')} />
        </motion.section>
      </div>
    </div>
  );
};

export default HomeSection;
