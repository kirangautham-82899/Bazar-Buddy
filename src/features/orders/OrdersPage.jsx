import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBoxOpen, FaClock, FaRedoAlt } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { cancelMyOrder, subscribeMyOrders } from '../../services/orderService';
import { STATUS_LABEL_KEYS, canCustomerCancel, estimatedDelivery, isActiveStatus, toDate } from '../../utils/orderStatus';
import { formatDateTime, formatRupees, itemName, shortId } from '../../utils/format';
import { Skeleton } from '../../components/motion';
import OrderTracker from './OrderTracker';
import './orders.css';

const OrderCard = ({ order }) => {
  const { changeQuantity } = useCart();
  const { findProduct } = useCatalog();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const created = toDate(order.createdAt);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const live = isActiveStatus(order.status);

  const handleCancel = async () => {
    if (!window.confirm(t('cancelConfirm'))) return;
    setBusy(true);
    try {
      await cancelMyOrder(order.id);
      toast.show(t('orderCancelled'), 'info');
    } catch (err) {
      console.error(err);
      toast.show(t('errGeneric'), 'error');
    } finally {
      setBusy(false);
    }
  };

  // Adds what's still in stock back to the cart.
  const handleReorder = async () => {
    const available = order.items.filter((i) => (findProduct(i.id)?.stock ?? 0) > 0);
    for (const item of available) await changeQuantity(item.id, item.quantity);
    toast.show(t('reorderAdded'));
  };

  return (
    <article className={`order-card ${live ? 'live' : ''}`}>
      <header className="order-card-head">
        <div>
          <strong>{t('orderNo', { id: shortId(order.id) })}</strong>
          <span className="muted small">
            {formatDateTime(created)} · {t('itemsCount', { n: itemCount })} · {formatRupees(order.total)}
          </span>
        </div>
        <span className={`badge ${order.status === 'cancelled' ? 'badge-danger' : order.status === 'delivered' ? 'badge-success' : ''}`}>
          {live && <span className="badge-pulse" aria-hidden="true" />}
          {t(STATUS_LABEL_KEYS[order.status])}
        </span>
      </header>

      <p className="order-items muted small">{order.items.map((i) => `${itemName(i)} × ${i.quantity}`).join(', ')}</p>

      {order.status !== 'cancelled' && <OrderTracker status={order.status} />}
      {live && (
        <p className="order-eta">
          <FaClock aria-hidden="true" /> {t('estimatedBy', { time: formatDateTime(estimatedDelivery(created, order.speed)) })}
        </p>
      )}

      <div className="order-actions">
        {canCustomerCancel(order.status) && (
          <button type="button" className="btn btn-danger btn-sm" onClick={handleCancel} disabled={busy}>{t('cancelOrder')}</button>
        )}
        {!live && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleReorder}>
            <FaRedoAlt aria-hidden="true" /> {t('reorder')}
          </button>
        )}
      </div>
    </article>
  );
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  useDocumentMeta({ title: `${t('myOrders')} – ${t('appName')}`, noindex: true });

  useEffect(() => subscribeMyOrders(user.uid, setOrders, (err) => {
    console.error(err);
    setOrders([]);
  }), [user.uid]);

  return (
    <div className="page orders-page">
      <h1 className="page-title">{t('myOrders')}</h1>
      {orders === null ? (
        <Skeleton lines={5} />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><FaBoxOpen aria-hidden="true" /></span>
          <h2>{t('noOrders')}</h2>
          <p>{t('noOrdersBody')}</p>
          <Link to="/shop" className="btn btn-sm">{t('startShopping')}</Link>
        </div>
      ) : (
        <motion.ul layout className="order-list">
          <AnimatePresence initial={false}>
            {orders.map((order) => (
              <motion.li key={order.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <OrderCard order={order} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
};

export default OrdersPage;
