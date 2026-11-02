import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { FaGift, FaShoppingBasket, FaTag, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';
import { placeOrder } from '../../services/orderService';
import { DELIVERY_OPTIONS, UPI_ID, VERIFIED_DELIVERY_FEE } from '../../config/app';
import { computeTotals, lineTotal } from '../../utils/pricing';
import { formatRupees, productName, shortId } from '../../utils/format';
import Modal from '../../components/common/Modal';
import ProductIcon from '../../components/common/ProductIcon';
import { AnimatedNumber, Confetti, SuccessCheck } from '../../components/motion';
import { QuantityStepper } from './ProductCard';

const SPEEDS = ['express', 'scheduled', 'saver'];

// Standard UPI deep link; any UPI app can scan the QR it encodes.
const upiLink = (order) =>
  `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Bazar Buddy')}&am=${order.total}&cu=INR&tn=${encodeURIComponent(`Order ${shortId(order.id)}`)}`;

const Money = ({ value }) => <AnimatedNumber value={value} duration={0.5} format={(n) => formatRupees(Math.round(n))} />;

const OrderPlacedModal = ({ order, onClose }) => {
  const { t } = useLanguage();
  return (
    <Modal open={Boolean(order)} title={t('orderSuccessTitle')} onClose={onClose}>
      {order && (
        <div className="order-success">
          <Confetti />
          <SuccessCheck />
          <p className="order-success-coins">{t('orderPlaced', { coins: order.coinsEarned })}</p>

          {order.payment === 'upi' && (
            <motion.div className="upi-pay" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3>{t('payViaUpi')}</h3>
              <div className="upi-qr">
                <QRCodeSVG value={upiLink(order)} size={184} level="M" fgColor="#1b2a1f" title={t('scanToPay', { total: order.total })} />
              </div>
              <p>{t('scanToPay', { total: order.total })}</p>
              <p className="muted small">{t('upiId', { id: UPI_ID })}</p>
              <a className="btn btn-outline btn-sm upi-app-link" href={upiLink(order)}>{t('openUpiApp')}</a>
              <p className="muted small">{t('upiNote')}</p>
            </motion.div>
          )}
          {order.otp && <p className="otp-box">{t('deliveryOtp', { otp: order.otp })}</p>}
          <button type="button" className="btn btn-block" onClick={onClose}>{t('done')}</button>
        </div>
      )}
    </Modal>
  );
};

const CartPanel = () => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const { cart, cartItems, removeFromCart, setCartOptions, reportError } = useShop();
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
      setPlacedOrder(await placeOrder(user.uid));
    } catch (err) {
      reportError(err);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="card cart-panel" id="cart" aria-labelledby="cart-title">
      <h2 id="cart-title" className="card-title">
        <span className="card-title-icon"><FaShoppingBasket aria-hidden="true" /></span>
        {t('cart')}
      </h2>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><FaShoppingBasket aria-hidden="true" /></span>
          <p>{t('emptyCart')}</p>
        </div>
      ) : (
        <>
          <motion.ul layout className="cart-lines">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => {
                const name = productName(item, language);
                return (
                  <motion.li
                    key={item.id}
                    layout
                    className="cart-line"
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 40, height: 0, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  >
                    <ProductIcon id={item.id} category={item.category} size="sm" />
                    <div className="cart-line-info">
                      <strong>{name}</strong>
                      <span className="muted">
                        {formatRupees(item.price)}{t('perUnit', { unit: item.unit })} · {formatRupees(lineTotal(item))}
                      </span>
                    </div>
                    <QuantityStepper item={item} name={name} compact />
                    <motion.button whileTap={{ scale: 0.85 }} type="button" className="icon-btn icon-btn-danger" onClick={() => removeFromCart(item.id)} aria-label={t('remove', { item: name })}>
                      <FaTrash aria-hidden="true" />
                    </motion.button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          <fieldset className="choice-group">
            <legend>{t('deliverySpeed')}</legend>
            {SPEEDS.map((speed) => (
              <label key={speed} className="choice">
                <input type="radio" name="delivery-speed" value={speed} checked={cart.speed === speed} onChange={() => setCartOptions({ speed })} />
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
                <input type="radio" name="payment" value={payment} checked={cart.payment === payment} onChange={() => setCartOptions({ payment })} />
                <span className="choice-text">{t(payment)}</span>
              </label>
            ))}
          </fieldset>

          <dl className="totals">
            <div><dt>{t('subtotal')}</dt><dd><Money value={totals.subtotal} /></dd></div>
            <div>
              <dt>{t('deliveryFee')}</dt>
              <dd>{totals.deliveryFee ? formatRupees(totals.deliveryFee) : t('free')}</dd>
            </div>
            {totals.verifiedFee > 0 && (
              <div><dt>{t('verifiedDelivery')}</dt><dd>{formatRupees(totals.verifiedFee)}</dd></div>
            )}
            <AnimatePresence>
              {totals.comboSavings > 0 && (
                <motion.p key="combo" className="totals-note" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <FaTag aria-hidden="true" /> {t('comboDiscount')}: {formatRupees(totals.comboSavings)}
                </motion.p>
              )}
              {totals.usesCredit && (
                <motion.p key="credit" className="totals-note" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <FaGift aria-hidden="true" /> {t('freeDeliveryApplied')}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="totals-grand"><dt>{t('total')}</dt><dd><Money value={totals.total} /></dd></div>
          </dl>

          <motion.button whileTap={{ scale: 0.97 }} type="button" className="btn btn-lg btn-block" onClick={handlePlaceOrder} disabled={placing}>
            {placing && <span className="btn-spinner" aria-hidden="true" />}
            {placing ? t('placingOrder') : t('placeOrder', { total: totals.total })}
          </motion.button>
        </>
      )}

      <OrderPlacedModal order={placedOrder} onClose={() => setPlacedOrder(null)} />
    </section>
  );
};

export default CartPanel;
