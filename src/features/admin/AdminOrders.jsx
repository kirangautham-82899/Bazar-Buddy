import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useToast } from '../../context/ToastContext';
import { adminCancelOrder, advanceOrder, subscribeAllOrders } from '../../services/orderService';
import { NEXT_STATUS, STATUS_LABEL_KEYS, canAdminCancel, toDate } from '../../utils/orderStatus';
import { formatAddress, formatDateTime, formatRupees, itemName, shortId } from '../../utils/format';
import { Skeleton } from '../../components/motion';

const FILTERS = ['active', 'placed', 'confirmed', 'packed', 'outForDelivery', 'delivered', 'cancelled'];
const FILTER_LABELS = { active: 'statusAll', placed: 'statusNew' };
const isOpen = (o) => o.status !== 'delivered' && o.status !== 'cancelled';

const ORDER_ERRORS = { 'out-of-stock': 'errOutOfStock', 'not-enough-stock': 'errNotEnoughStock', 'price-changed': 'errPriceChanged' };

const AdminOrderRow = ({ order }) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const next = NEXT_STATUS[order.status];

  const run = async (action, status) => {
    setBusy(true);
    try {
      await action();
      toast.show(t('statusUpdated', { id: shortId(order.id), status: t(STATUS_LABEL_KEYS[status]) }));
    } catch (err) {
      console.error(err);
      toast.show(ORDER_ERRORS[err.code] ? t(ORDER_ERRORS[err.code], err.details) : t('errGeneric'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`admin-order status-${order.status}`}>
      <header className="admin-order-head">
        <div>
          <strong>{t('orderNo', { id: shortId(order.id) })}</strong>
          <span className="muted small">{formatDateTime(toDate(order.createdAt))} · {t(order.speed)} · {t(order.payment)}</span>
        </div>
        <span className="badge">{t(STATUS_LABEL_KEYS[order.status])}</span>
      </header>

      <div className="admin-order-body">
        <div className="admin-order-customer">
          <strong>{order.customer?.name}</strong>
          {order.customer?.phone && (
            <a href={`tel:${order.customer.phone}`}><FaPhone aria-hidden="true" /> {order.customer.phone}</a>
          )}
          <span className="muted small"><FaMapMarkerAlt aria-hidden="true" /> {formatAddress(order.address)}</span>
        </div>
        <ul className="admin-order-items">
          {order.items.map((item) => (
            <li key={item.id}>
              <span>{itemName(item)} <span className="muted">× {item.quantity} {item.unit}</span></span>
              <span>{formatRupees(item.price * item.quantity)}</span>
            </li>
          ))}
          <li className="admin-order-total">
            <span>{t('orderTotal')}{order.deliveryFee ? ` (${t('deliveryFee')} ${formatRupees(order.deliveryFee)})` : ''}</span>
            <strong>{formatRupees(order.total)}</strong>
          </li>
        </ul>
      </div>

      {(next || canAdminCancel(order.status)) && (
        <div className="admin-order-actions">
          {next && (
            <button type="button" className="btn btn-sm" disabled={busy} onClick={() => run(() => advanceOrder(order.id, next.status), next.status)}>
              {t(next.labelKey)}
            </button>
          )}
          {canAdminCancel(order.status) && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={busy}
              onClick={() => window.confirm(t('cancelConfirm')) && run(() => adminCancelOrder(order.id), 'cancelled')}
            >
              {t('adminCancel')}
            </button>
          )}
        </div>
      )}
    </article>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => subscribeAllOrders(setOrders, (err) => {
    console.error(err);
    setOrders([]);
  }), []);

  const counts = useMemo(() => {
    const c = { active: 0 };
    (orders || []).forEach((o) => {
      c[o.status] = (c[o.status] || 0) + 1;
      if (isOpen(o)) c.active += 1;
    });
    return c;
  }, [orders]);

  const visible = useMemo(
    () => (orders || []).filter((o) => (filter === 'active' ? isOpen(o) : o.status === filter)),
    [orders, filter]
  );

  return (
    <div className="admin-page">
      <div className="admin-filters" role="group" aria-label={t('adminOrders')}>
        {FILTERS.map((f) => (
          <button key={f} type="button" className={`chip ${filter === f ? 'active' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {filter === f && <motion.span layoutId="admin-filter-pill" className="chip-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
            <span className="chip-label">{t(FILTER_LABELS[f] || STATUS_LABEL_KEYS[f])}</span>
            {counts[f] > 0 && <span className="chip-count">{counts[f]}</span>}
          </button>
        ))}
      </div>

      {orders === null ? (
        <Skeleton lines={6} />
      ) : visible.length === 0 ? (
        <p className="empty-state">{t('noAdminOrders')}</p>
      ) : (
        <motion.ul layout className="admin-order-list">
          <AnimatePresence initial={false}>
            {visible.map((order) => (
              <motion.li key={order.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }}>
                <AdminOrderRow order={order} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
};

export default AdminOrders;
