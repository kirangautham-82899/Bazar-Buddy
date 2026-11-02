// orders/{orderId}: one document per order, readable only by the vendor who placed it.
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { computeTotals } from '../utils/pricing';
import { resolveCartItems } from './catalogService';

const generateOtp = () => {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return String(1000 + (values[0] % 9000));
};

export const placeOrder = (uid) =>
  runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', uid);
    const cartRef = doc(db, 'carts', uid);
    const [userSnap, cartSnap] = await Promise.all([tx.get(userRef), tx.get(cartRef)]);
    if (!userSnap.exists()) throw new Error('profile-missing');

    // Re-read the cart inside the transaction so the order matches what was saved.
    const cart = cartSnap.exists() ? cartSnap.data() : null;
    const items = resolveCartItems(cart?.items || []);
    if (!items.length) throw new Error('empty-cart');

    const user = userSnap.data();
    const options = {
      speed: cart.speed || 'saver',
      verified: Boolean(cart.verified),
      freeDeliveryCredits: user.freeDeliveryCredits || 0,
    };
    const totals = computeTotals(items, options);
    const orderRef = doc(collection(db, 'orders'));
    const otp = options.verified ? generateOtp() : null;

    tx.set(orderRef, {
      uid,
      items: items.map(({ id, name, price, unit, quantity, emoji }) => ({ id, name, price, unit, quantity, emoji })),
      speed: options.speed,
      verified: options.verified,
      otp,
      payment: cart.payment || 'upi',
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      verifiedFee: totals.verifiedFee,
      usedFreeDelivery: totals.usesCredit,
      total: totals.total,
      coinsEarned: totals.coinsEarned,
      savings: totals.comboSavings + totals.creditSaving,
      status: 'placed',
      createdAt: serverTimestamp(),
    });

    tx.update(userRef, {
      coins: (user.coins || 0) + totals.coinsEarned,
      freeDeliveryCredits: options.freeDeliveryCredits - (totals.usesCredit ? 1 : 0),
      savings: (user.savings || 0) + totals.comboSavings + totals.creditSaving,
    });
    tx.update(cartRef, { items: [], updatedAt: serverTimestamp() });

    return { id: orderRef.id, total: totals.total, coinsEarned: totals.coinsEarned, payment: cart.payment || 'upi', otp };
  });

export const subscribeOrders = (uid, onChange, onError) =>
  onSnapshot(
    query(collection(db, 'orders'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(50)),
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))),
    onError
  );

// Cancelling gives back the coins earned and any free-delivery credit used.
export const cancelOrder = (uid, orderId) =>
  runTransaction(db, async (tx) => {
    const orderRef = doc(db, 'orders', orderId);
    const userRef = doc(db, 'users', uid);
    const [orderSnap, userSnap] = await Promise.all([tx.get(orderRef), tx.get(userRef)]);
    if (!orderSnap.exists() || orderSnap.data().status === 'cancelled') return;

    const order = orderSnap.data();
    const user = userSnap.data() || {};
    tx.update(orderRef, { status: 'cancelled', cancelledAt: serverTimestamp() });
    tx.update(userRef, {
      coins: Math.max(0, (user.coins || 0) - (order.coinsEarned || 0)),
      freeDeliveryCredits: (user.freeDeliveryCredits || 0) + (order.usedFreeDelivery ? 1 : 0),
      savings: Math.max(0, (user.savings || 0) - (order.savings || 0)),
    });
  });
