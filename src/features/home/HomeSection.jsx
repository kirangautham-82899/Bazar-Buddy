import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaBoxOpen, FaGift, FaRedoAlt, FaStore, FaTruck } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { useNow } from '../../hooks/useNow';
import { combos } from '../../data/products';
import { COINS_FOR_FREE_DELIVERY } from '../../config/app';
import { getOrderStage, isActiveStage, recentPurchases } from '../../utils/orderStatus';
import { formatRupees, productName } from '../../utils/format';
import ProductIcon from '../../components/common/ProductIcon';
import { AnimatedNumber, Stagger, staggerItem } from '../../components/motion';
import OrderList from '../orders/OrderList';
import './HomeSection.css';

const RING_RADIUS = 42;

// Progress ring toward the next free delivery; the arc draws in on load.
const CoinRing = ({ coins }) => {
  const { t } = useLanguage();
  const progress = Math.min(coins / COINS_FOR_FREE_DELIVERY, 1);
  return (
    <div className="coin-ring" role="img" aria-label={`${t('apnaCoins')}: ${coins}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={RING_RADIUS} className="coin-ring-track" />
        <motion.circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          className="coin-ring-fill"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="coin-ring-center" aria-hidden="true">
        <strong>
          <AnimatedNumber value={coins} />
        </strong>
        <span>{t('apnaCoins')}</span>
      </div>
    </div>
  );
};

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
  const firstName = profile?.name?.split(' ')[0];

  const handleAdd = async (product, quantity = 1) => {
    await addToCart(product.id, quantity);
    toast.show(t('reorderAdded', { item: productName(product, language) }));
  };

  return (
    <div className="page home-page">
      <motion.section
        className="home-hero"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="home-hero-copy">
          <p className="home-hero-date">
            {new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}
          </p>
          <h1 className="home-greeting">{firstName ? t('greeting', { name: firstName }) : t('greetingFallback')}</h1>
          <p className="home-hero-sub">{coinsToGo ? t('coinsToGo', { n: coinsToGo }) : t('coinsReady')}</p>
          <div className="home-hero-actions">
            <Link to="/dashboard/market" className="btn btn-sm home-hero-btn">
              <FaStore aria-hidden="true" /> {t('shopNow')}
            </Link>
            <Link to="/dashboard/wallet" className="btn btn-sm btn-glass">
              {t('goToWallet')} <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <CoinRing coins={coins} />
      </motion.section>

      <Stagger className="grid grid-2 home-grid" delay={0.15}>
        <motion.section className="card" variants={staggerItem} aria-labelledby="reorder-title">
          <h2 id="reorder-title" className="card-title">
            <span className="card-title-icon"><FaRedoAlt aria-hidden="true" /></span>
            {t('quickReorder')}
          </h2>
          {reorderList.length ? (
            <ul className="home-list">
              {reorderList.map(({ product, quantity }) => (
                <motion.li key={product.id} className="home-row" whileHover={{ x: 4 }}>
                  <ProductIcon id={product.id} category={product.category} size="sm" />
                  <span className="home-row-text">
                    <strong>{productName(product, language)}</strong>
                    <span className="muted small">{quantity} {product.unit}</span>
                  </span>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleAdd(product, quantity)}>
                    {t('reorder')}
                  </button>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-icon"><FaBoxOpen aria-hidden="true" /></span>
              <p>{t('noPastOrders')}</p>
              <Link to="/dashboard/market" className="btn btn-sm">{t('shopNow')}</Link>
            </div>
          )}
        </motion.section>

        <motion.section className="card" variants={staggerItem} aria-labelledby="offers-title">
          <h2 id="offers-title" className="card-title">
            <span className="card-title-icon"><FaGift aria-hidden="true" /></span>
            {t('offers')}
          </h2>
          <ul className="home-list">
            {combos.map((combo) => (
              <motion.li key={combo.id} className="home-row" whileHover={{ x: 4 }}>
                <ProductIcon id={combo.id} category={combo.category} size="sm" />
                <span className="home-row-text">
                  <strong>{productName(combo, language)}</strong>
                  <span className="small">
                    <strong className="home-price">{formatRupees(combo.price)}</strong>{' '}
                    <s className="muted">{formatRupees(combo.mrp)}</s>
                  </span>
                </span>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleAdd(combo)}>
                  {t('add')}
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.section className="card home-active" variants={staggerItem} aria-labelledby="active-title">
          <div className="card-title home-active-head">
            <h2 id="active-title" className="card-title" style={{ margin: 0 }}>
              <span className="card-title-icon"><FaTruck aria-hidden="true" /></span>
              {t('activeOrders')}
            </h2>
            {orders.length > 0 && <Link to="/dashboard/market#orders" className="btn btn-ghost btn-sm">{t('viewAll')}</Link>}
          </div>
          <OrderList orders={activeOrders.slice(0, 3)} loading={ordersLoading} compact emptyText={t('noActiveOrders')} />
        </motion.section>
      </Stagger>
    </div>
  );
};

export default HomeSection;
