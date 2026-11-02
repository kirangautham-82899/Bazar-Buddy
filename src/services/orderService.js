// orders/{orderId}
//   uid, customer {name, phone}, address, items [{id, name, unit, price, quantity}],
//   itemTotal, deliveryFee, total, speed, payment, status, statusHistory[], createdAt
// Customers create orders and may cancel before packing; admins move them along.
import {
  Timestamp,
  arrayUnion,
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
import { canAdminCancel, canCustomerCancel } from '../utils/orderStatus';

export class OrderError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.code = code;
    this.details = details;
  }
}

const withIds = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
const historyEntry = (status) => ({ status, at: Timestamp.now() });

// Reads the saved cart and live product docs inside one transaction, so the order
// uses current prices and is rejected if anything is out of stock.
export const placeOrder = (uid) =>
  runTransaction(db, async (tx) => {
    const [cartSnap, userSnap] = await Promise.all([tx.get(doc(db, 'carts', uid)), tx.get(doc(db, 'users', uid))]);
    const cart = cartSnap.exists() ? cartSnap.data() : null;
    const lines = cart?.items || [];
    if (!lines.length) throw new OrderError('empty-cart');

    const user = userSnap.data() || {};
    if (!user.address) throw new OrderError('no-address');

    const productSnaps = await Promise.all(lines.map((line) => tx.get(doc(db, 'products', line.id))));
    const items = lines.map((line, i) => {
      const product = productSnaps[i].exists() ? productSnaps[i].data() : null;
      if (!product || !product.active || product.stock <= 0) throw new OrderError('out-of-stock', { item: product?.name || line.id });
      if (product.stock < line.quantity) throw new OrderError('not-enough-stock', { item: product.name, n: product.stock });
      return { id: line.id, name: product.name, unit: product.unit, price: product.price, mrp: product.mrp || null, quantity: line.quantity };
    });

    const speed = cart.speed || 'saver';
    const totals = computeTotals(items, { speed });
    const orderRef = doc(collection(db, 'orders'));
    tx.set(orderRef, {
      uid,
      customer: { name: user.address.name || user.name || '', phone: user.address.phone || user.phone || '' },
      address: user.address,
      items,
      itemTotal: totals.itemTotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      speed,
      payment: cart.payment || 'upi',
      status: 'placed',
      statusHistory: [historyEntry('placed')],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.update(doc(db, 'carts', uid), { items: [], updatedAt: serverTimestamp() });
    return { id: orderRef.id, total: totals.total, payment: cart.payment || 'upi' };
  });

export const subscribeMyOrders = (uid, onChange, onError) =>
  onSnapshot(
    query(collection(db, 'orders'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(50)),
    (snap) => onChange(withIds(snap)),
    onError
  );

export const cancelMyOrder = (orderId) =>
  runTransaction(db, async (tx) => {
    const ref = doc(db, 'orders', orderId);
    const snap = await tx.get(ref);
    if (!snap.exists() || !canCustomerCancel(snap.data().status)) return;
    tx.update(ref, { status: 'cancelled', statusHistory: arrayUnion(historyEntry('cancelled')), updatedAt: serverTimestamp() });
  });

/* Admin */

export const subscribeAllOrders = (onChange, onError) =>
  onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(200)), (snap) => onChange(withIds(snap)), onError);

// Confirming re-checks prices against the live catalog (orders are written by the
// customer's device) and deducts stock. Later steps only change the status.
export const advanceOrder = (orderId, nextStatus) =>
  runTransaction(db, async (tx) => {
    const ref = doc(db, 'orders', orderId);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const order = snap.data();

    if (nextStatus === 'confirmed') {
      const productSnaps = await Promise.all(order.items.map((item) => tx.get(doc(db, 'products', item.id))));
      const live = order.items.map((item, i) => {
        const product = productSnaps[i].data();
        if (!product) throw new OrderError('out-of-stock', { item: item.name });
        if (product.stock < item.quantity) throw new OrderError('not-enough-stock', { item: product.name, n: product.stock });
        return { ...item, price: product.price };
      });
      const expected = computeTotals(live, { speed: order.speed }).total;
      if (expected !== order.total) throw new OrderError('price-changed', { expected });
      order.items.forEach((item, i) => {
        tx.update(productSnaps[i].ref, { stock: productSnaps[i].data().stock - item.quantity, updatedAt: serverTimestamp() });
      });
    }

    tx.update(ref, { status: nextStatus, statusHistory: arrayUnion(historyEntry(nextStatus)), updatedAt: serverTimestamp() });
  });

// Cancelling after confirmation puts the stock back.
export const adminCancelOrder = (orderId) =>
  runTransaction(db, async (tx) => {
    const ref = doc(db, 'orders', orderId);
    const snap = await tx.get(ref);
    if (!snap.exists() || !canAdminCancel(snap.data().status)) return;
    const order = snap.data();
    const restock = order.status !== 'placed';
    const productSnaps = restock ? await Promise.all(order.items.map((item) => tx.get(doc(db, 'products', item.id)))) : [];
    productSnaps.forEach((p, i) => {
      if (p.exists()) tx.update(p.ref, { stock: p.data().stock + order.items[i].quantity, updatedAt: serverTimestamp() });
    });
    tx.update(ref, { status: 'cancelled', statusHistory: arrayUnion(historyEntry('cancelled')), updatedAt: serverTimestamp() });
  });
