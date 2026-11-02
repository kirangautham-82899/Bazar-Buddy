import React, { useState } from 'react';
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
import Loader from '../../components/common/Loader';
import './OrderList.css';

const OrderTracker = ({ stage }) => {
  const { t } = useLanguage();
  const current = STAGES.indexOf(stage);
  return (
    <ol className="tracker" aria-label={t('trackingLabel')}>
      {STAGES.map((s, i) => (
        <li key={s} className={i <= current ? 'done' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="tracker-dot" aria-hidden="true" />
          <span className="tracker-label">{t(STAGE_LABEL_KEYS[s])}</span>
        </li>
      ))}
    </ol>
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
    <article className="order-item">
      <header className="order-item-head">
        <div>
          <strong>{t('orderNo', { id: shortId(order.id) })}</strong>
          <span className="muted order-item-meta">
            {formatDateTime(created, language)} · {t('itemsCount', { n: itemCount })} · {formatRupees(order.total)}
          </span>
        </div>
        <span className={`badge ${stage === 'cancelled' ? 'badge-danger' : stage === 'delivered' ? 'badge-success' : ''}`}>
          {t(STAGE_LABEL_KEYS[stage])}
        </span>
      </header>

      {!compact && (
        <p className="order-item-products muted">
          {order.items.map((i) => `${i.emoji} ${i.name?.[language] || i.name?.en} × ${i.quantity}`).join(', ')}
        </p>
      )}

      {stage !== 'cancelled' && (
        <>
          <OrderTracker stage={stage} />
          {stage !== 'delivered' && (
            <p className="order-item-eta">{t('estimatedBy', { time: formatDateTime(estimatedDelivery(created || now, order.speed), language) })}</p>
          )}
        </>
      )}

      {order.otp && stage !== 'delivered' && stage !== 'cancelled' && (
        <p className="otp-box">{t('deliveryOtp', { otp: order.otp })}</p>
      )}

      {!compact && canCancel(stage) && (
        <button type="button" className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>
          {t('cancelOrder')}
        </button>
      )}
    </article>
  );
};

const OrderList = ({ orders, loading, compact = false, emptyText }) => {
  const { t } = useLanguage();
  const now = useNow();
  if (loading) return <Loader />;
  if (!orders.length) return <p className="empty-state">{emptyText || t('noOrders')}</p>;
  return (
    <ul className="order-list">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderItem order={order} now={now} compact={compact} />
        </li>
      ))}
    </ul>
  );
};

export default OrderList;
