import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { placeOrder } from '../../services/orderService';
import { DELIVERY_OPTIONS, UPI_ID, VERIFIED_DELIVERY_FEE } from '../../config/app';
import { computeTotals, lineTotal } from '../../utils/pricing';
import { formatRupees, productName } from '../../utils/format';
import Modal from '../../components/common/Modal';
import { QuantityStepper } from './ProductCard';
import upiQr from '../../assets/images/upi-qr.png';

const SPEEDS = ['express', 'scheduled', 'saver'];

const CartPanel = () => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const { cart, cartItems, removeFromCart, setCartOptions, reportError } = useShop();
  const toast = useToast();
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const totals = computeTotals(cartItems, {
    speed: cart.speed,
    verified: cart.verified,
    freeDeliveryCredits: profile?.freeDeliveryCredits || 0,
  });

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const order = await placeOrder(user.uid);
      toast.show(t('orderPlaced', { coins: order.coinsEarned }));
      if (order.payment === 'upi' || order.otp) setPlacedOrder(order);
    } catch (err) {
      reportError(err);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="card cart-panel" id="cart" aria-labelledby="cart-title">
      <h2 id="cart-title" className="card-title">🧺 {t('cart')}</h2>

      {cartItems.length === 0 ? (
        <p className="empty-state">{t('emptyCart')}</p>
      ) : (
        <>
          <ul className="cart-lines">
            {cartItems.map((item) => {
              const name = productName(item, language);
              return (
                <li key={item.id} className="cart-line">
                  <span className="cart-line-emoji" aria-hidden="true">{item.emoji}</span>
                  <div className="cart-line-info">
                    <strong>{name}</strong>
                    <span className="muted">
                      {formatRupees(item.price)}{t('perUnit', { unit: item.unit })} · {formatRupees(lineTotal(item))}
                    </span>
                  </div>
                  <QuantityStepper item={item} name={name} />
                  <button type="button" className="icon-btn cart-remove" onClick={() => removeFromCart(item.id)} aria-label={t('remove', { item: name })}>
                    <FaTrash aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>

          <fieldset className="choice-group">
            <legend>{t('deliverySpeed')}</legend>
            {SPEEDS.map((speed) => (
              <label key={speed} className="choice">
                <input
                  type="radio"
                  name="delivery-speed"
                  value={speed}
                  checked={cart.speed === speed}
                  onChange={() => setCartOptions({ speed })}
                />
                <span className="choice-text">
                  <span>{t(speed)}</span>
                  <small>{t(`${speed}Desc`)}</small>
                </span>
                <span className="muted">{DELIVERY_OPTIONS[speed].fee ? formatRupees(DELIVERY_OPTIONS[speed].fee) : t('free')}</span>
              </label>
            ))}
          </fieldset>

          <label className="choice choice-standalone">
            <input type="checkbox" checked={cart.verified} onChange={(e) => setCartOptions({ verified: e.target.checked })} />
            <span className="choice-text">
              <span>{t('verifiedDelivery')}</span>
              <small>{t('verifiedDesc')}</small>
            </span>
            <span className="muted">{formatRupees(VERIFIED_DELIVERY_FEE)}</span>
          </label>

          <fieldset className="choice-group choice-row">
            <legend>{t('paymentMethod')}</legend>
            {['upi', 'cod'].map((payment) => (
              <label key={payment} className="choice">
                <input
                  type="radio"
                  name="payment"
                  value={payment}
                  checked={cart.payment === payment}
                  onChange={() => setCartOptions({ payment })}
                />
                <span className="choice-text">{t(payment)}</span>
              </label>
            ))}
          </fieldset>

          <dl className="totals">
            <div><dt>{t('subtotal')}</dt><dd>{formatRupees(totals.subtotal)}</dd></div>
            {totals.comboSavings > 0 && (
              <p className="totals-note">🏷️ {t('comboDiscount')}: {formatRupees(totals.comboSavings)}</p>
            )}
            <div>
              <dt>{t('deliveryFee')}</dt>
              <dd>{totals.deliveryFee ? formatRupees(totals.deliveryFee) : t('free')}</dd>
            </div>
            {totals.usesCredit && <p className="totals-note">🎁 {t('freeDeliveryApplied')}</p>}
            {totals.verifiedFee > 0 && (
              <div><dt>{t('verifiedDelivery')}</dt><dd>{formatRupees(totals.verifiedFee)}</dd></div>
            )}
            <div className="totals-grand"><dt>{t('total')}</dt><dd>{formatRupees(totals.total)}</dd></div>
          </dl>

          <button type="button" className="btn btn-block" onClick={handlePlaceOrder} disabled={placing}>
            {placing ? t('placingOrder') : t('placeOrder', { total: totals.total })}
          </button>
        </>
      )}

      <Modal open={Boolean(placedOrder)} title={placedOrder?.payment === 'upi' ? t('payViaUpi') : t('statusPlaced')} onClose={() => setPlacedOrder(null)}>
        {placedOrder?.payment === 'upi' && (
          <div className="upi-pay">
            <img src={upiQr} alt={t('upiId', { id: UPI_ID })} className="upi-qr" />
            <p>{t('scanToPay', { total: placedOrder.total })}</p>
            <p className="muted">{t('upiId', { id: UPI_ID })}</p>
            <p className="muted small">{t('upiNote')}</p>
          </div>
        )}
        {placedOrder?.otp && <p className="otp-box">{t('deliveryOtp', { otp: placedOrder.otp })}</p>}
        <button type="button" className="btn btn-block" onClick={() => setPlacedOrder(null)}>{t('done')}</button>
      </Modal>
    </section>
  );
};

export default CartPanel;
