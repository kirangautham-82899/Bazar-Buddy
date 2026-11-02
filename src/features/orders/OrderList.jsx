import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBoxOpen, FaClock, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { useNow } from '../../hooks/useNow';
import { cancelOrder } from '../../services/orderService';
import {
  STAGES,
  STAGE_LABEL_KEYS,
  canCancel,
  estimatedDelivery,
  getOrderStage,
  toDate,
} from '../../utils/orderStatus';
import { formatDateTime, formatRupees, shortId } from '../../utils/format';
import { findProduct } from '../../data/products';
import ProductIcon from '../../components/common/ProductIcon';
import { Skeleton } from '../../components/motion';
import './OrderList.css';

// Four steps joined by a bar that fills up to the current stage.
const OrderTracker = ({ stage }) => {
  const { t } = useLanguage();
  const current = STAGES.indexOf(stage);
  const fill = current / (STAGES.length - 1);
  return (
    <div className="tracker" aria-label={t('trackingLabel')}>
      <div className="tracker-bar" aria-hidden="true">
        <motion.span
          className="tracker-bar-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: fill }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <ol className="tracker-steps">
        {STAGES.map((s, i) => (
          <li key={s} className={`${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`} aria-current={i === current ? 'step' : undefined}>
            <span className="tracker-dot" aria-hidden="true" />
            <span className="tracker-label">{t(STAGE_LABEL_KEYS[s])}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

const OrderItem = ({ order, now, compact = false }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { reportError } = useShop();
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const stage = getOrderStage(order, now);
  const created = toDate(order.createdAt);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const live = stage !== 'cancelled' && stage !== 'delivered';

  const handleCancel = async () => {
    if (!window.confirm(t('cancelConfirm'))) return;
    setCancelling(true);
    try {
      await cancelOrder(user.uid, order.id);
      toast.show(t('orderCancelled'), 'info');
    } catch (err) {
      reportError(err);
      setCancelling(false);
    }
  };

  return (
    <article className={`order-item ${live ? 'live' : ''}`}>
      <header className="order-item-head">
        <div>
          <strong>{t('orderNo', { id: shortId(order.id) })}</strong>
          <span className="muted order-item-meta">
            {formatDateTime(created, language)} · {t('itemsCount', { n: itemCount })} · {formatRupees(order.total)}
          </span>
        </div>
        <span className={`badge ${stage === 'cancelled' ? 'badge-danger' : stage === 'delivered' ? 'badge-success' : ''}`}>
          {live && <span className="badge-pulse" aria-hidden="true" />}
          {t(STAGE_LABEL_KEYS[stage])}
        </span>
      </header>

      {!compact && (
        <ul className="order-products">
          {order.items.map((i) => (
            <li key={i.id} className="order-product">
              <ProductIcon id={i.id} category={findProduct(i.id)?.category} size="sm" />
              <span>{i.name?.[language] || i.name?.en}</span>
              <span className="muted">× {i.quantity}</span>
            </li>
          ))}
        </ul>
      )}

      {stage !== 'cancelled' && (
        <>
          <OrderTracker stage={stage} />
          {live && (
            <p className="order-item-eta">
              <FaClock aria-hidden="true" /> {t('estimatedBy', { time: formatDateTime(estimatedDelivery(created || now, order.speed), language) })}
            </p>
          )}
        </>
      )}

      {order.otp && live && (
        <p className="otp-box">
          <FaShieldAlt aria-hidden="true" /> {t('deliveryOtp', { otp: order.otp })}
        </p>
      )}

      {!compact && canCancel(stage) && (
        <button type="button" className="btn btn-danger btn-sm order-cancel" onClick={handleCancel} disabled={cancelling}>
          {t('cancelOrder')}
        </button>
      )}
    </article>
  );
};

const OrderList = ({ orders, loading, compact = false, emptyText }) => {
  const { t } = useLanguage();
  const now = useNow();
  if (loading) return <Skeleton lines={4} />;
  if (!orders.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><FaBoxOpen aria-hidden="true" /></span>
        <p>{emptyText || t('noOrders')}</p>
      </div>
    );
  }
  return (
    <motion.ul layout className="order-list">
      <AnimatePresence initial={false}>
        {orders.map((order) => (
          <motion.li
            key={order.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <OrderItem order={order} now={now} compact={compact} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
};

export default OrderList;
