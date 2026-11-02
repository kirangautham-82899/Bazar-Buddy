import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaMapMarkerAlt, FaShoppingBasket, FaTag, FaTrash, FaTruck } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { placeOrder } from '../../services/orderService';
import { DELIVERY_OPTIONS, DELIVERY_SPEEDS, FREE_DELIVERY_ABOVE, PAYMENT_METHODS } from '../../config/app';
import { formatAddress, formatRupees } from '../../utils/format';
import { lineTotal } from '../../utils/pricing';
import ProductIcon from '../../components/common/ProductIcon';
import Modal from '../../components/common/Modal';
import QuantityStepper from '../shop/QuantityStepper';
import AddressForm from './AddressForm';
import OrderPlacedModal from './OrderPlacedModal';
import './cart.css';

const ORDER_ERRORS = {
  'out-of-stock': 'errOutOfStock',
  'not-enough-stock': 'errNotEnoughStock',
  'empty-cart': 'errEmptyCart',
  'no-address': 'errNoAddress',
};

// Amounts are always shown exactly; a change just gives the number a small pop.
const Money = ({ value }) => (
  <motion.span
    key={value}
    className="money"
    initial={{ scale: 1.15, opacity: 0.6 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
  >
    {formatRupees(value)}
  </motion.span>
);

const CartPage = () => {
  const { user, profile } = useAuth();
  const { cart, items, totals, removeItem, setOptions, reportError } = useCart();
  const toast = useToast();
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [editingAddress, setEditingAddress] = useState(false);
  useDocumentMeta({ title: `${t('cart')} – ${t('appName')}`, noindex: true });

  const address = profile?.address;
  const hasUnavailable = items.some((i) => !i.available);
  const progress = Math.min(1, totals.itemTotal / FREE_DELIVERY_ABOVE);

  const handlePlaceOrder = async () => {
    if (!address) {
      setEditingAddress(true);
      return;
    }
    setPlacing(true);
    try {
      setPlacedOrder(await placeOrder(user.uid));
    } catch (err) {
      if (ORDER_ERRORS[err.code]) toast.show(t(ORDER_ERRORS[err.code], err.details), 'error');
      else reportError(err);
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length && !placedOrder) {
    return (
      <div className="page">
        <div className="empty-state cart-empty">
          <span className="empty-icon">
            <FaShoppingBasket aria-hidden="true" />
          </span>
          <h1>{t('emptyCart')}</h1>
          <p>{t('emptyCartBody')}</p>
          <Link to="/shop" className="btn">
            {t('startShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h1 className="page-title">{t('cart')}</h1>

      {/* Phones: one column with a sticky Place order button.
          Desktop: details on the left, bill and Place order pinned on the right. */}
      <div className="cart-columns">
        <div className="cart-main">
          <section className="cart-block" aria-label={t('cart')}>
            <div className="free-delivery">
              <p>
                <FaTruck aria-hidden="true" />{' '}
                {totals.freeDelivery ? t('freeDeliveryUnlocked') : t('freeDeliveryNudge', { amount: totals.amountToFreeDelivery })}
              </p>
              <div className="free-delivery-bar" aria-hidden="true">
                <motion.span initial={false} animate={{ scaleX: progress }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
              </div>
            </div>

            <motion.ul layout className="cart-lines">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    className={`cart-line ${item.available ? '' : 'unavailable'}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, x: 40, height: 0, transition: { duration: 0.2 } }}
                  >
                    <ProductIcon icon={item.icon} category={item.category} size="md" />
                    <div className="cart-line-info">
                      <strong>{item.name}</strong>
                      {item.available ? (
                        <span className="muted">
                          1 {item.unit} · {formatRupees(item.price)}
                        </span>
                      ) : (
                        <span className="cart-line-warning">{t('outOfStock')}</span>
                      )}
                    </div>
                    {item.available ? (
                      <div className="cart-line-end">
                        <QuantityStepper product={item} quantity={item.quantity} size="sm" />
                        <span className="cart-line-total">{formatRupees(lineTotal(item))}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        onClick={() => removeItem(item.id)}
                        aria-label={t('remove', { item: item.name })}
                      >
                        <FaTrash aria-hidden="true" />
                      </button>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </section>

          <section className="cart-block">
            <fieldset className="choice-group">
              <legend>{t('deliverySpeed')}</legend>
              {DELIVERY_SPEEDS.map((speed) => (
                <label key={speed} className="choice">
                  <input type="radio" name="delivery-speed" checked={cart.speed === speed} onChange={() => setOptions({ speed })} />
                  <span className="choice-text">
                    <span>{t(speed)}</span>
                    <small>{t(`${speed}Desc`)}</small>
                  </span>
                  <span className="muted">
                    {DELIVERY_OPTIONS[speed].fee && !totals.freeDelivery ? formatRupees(DELIVERY_OPTIONS[speed].fee) : t('free')}
                  </span>
                </label>
              ))}
            </fieldset>
          </section>

          {user && (
            <section className="cart-block" aria-labelledby="address-title">
              <div className="cart-block-head">
                <h2 id="address-title">{t('deliveryAddress')}</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingAddress(true)}>
                  {address ? t('changeAddress') : t('addAddress')}
                </button>
              </div>
              {address ? (
                <p className="cart-address">
                  <FaMapMarkerAlt aria-hidden="true" />
                  <span>
                    <strong>{address.name}</strong> · {address.phone}
                    <br />
                    {formatAddress(address)}
                  </span>
                </p>
              ) : (
                <p className="muted">{t('addAddressToOrder')}</p>
              )}
            </section>
          )}

          <section className="cart-block">
            <fieldset className="choice-group choice-row">
              <legend>{t('paymentMethod')}</legend>
              {PAYMENT_METHODS.map((payment) => (
                <label key={payment} className="choice">
                  <input type="radio" name="payment" checked={cart.payment === payment} onChange={() => setOptions({ payment })} />
                  <span className="choice-text">{t(payment)}</span>
                </label>
              ))}
            </fieldset>
          </section>
        </div>

        <aside className="cart-summary">
          <section className="cart-block" aria-labelledby="bill-title">
            <h2 id="bill-title">{t('billDetails')}</h2>
            <dl className="bill">
              <div>
                <dt>{t('itemTotal')}</dt>
                <dd>
                  <Money value={totals.itemTotal} />
                </dd>
              </div>
              <div>
                <dt>{t('deliveryFee')}</dt>
                <dd>{totals.deliveryFee ? formatRupees(totals.deliveryFee) : t('free')}</dd>
              </div>
              <div className="bill-total">
                <dt>{t('toPay')}</dt>
                <dd>
                  <Money value={totals.total} />
                </dd>
              </div>
            </dl>
            {totals.savings > 0 && (
              <p className="bill-savings">
                <FaTag aria-hidden="true" /> {t('youSave', { amount: formatRupees(totals.savings) })}
              </p>
            )}
          </section>

          <div className="checkout-bar">
            {user ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                className="btn btn-lg btn-block"
                onClick={handlePlaceOrder}
                disabled={placing || hasUnavailable || !totals.total}
              >
                {placing && <span className="btn-spinner" aria-hidden="true" />}
                {placing ? t('placingOrder') : address ? t('placeOrder', { total: totals.total }) : t('addAddress')}
              </motion.button>
            ) : (
              <Link to="/auth?next=/cart" className="btn btn-lg btn-block">
                {t('loginToOrder')}
              </Link>
            )}
          </div>
        </aside>
      </div>

      <Modal open={editingAddress} title={t('deliveryAddress')} onClose={() => setEditingAddress(false)}>
        <AddressForm onSaved={() => setEditingAddress(false)} />
      </Modal>
      <OrderPlacedModal order={placedOrder} onClose={() => setPlacedOrder(null)} />
    </div>
  );
};

export default CartPage;
