// One cart document per vendor: carts/{uid}
//   items:    [{ id, quantity }]   prices are always read from the catalog
//   speed:    'express' | 'scheduled' | 'saver'
//   verified: boolean               OTP-verified delivery
//   payment:  'upi' | 'cod'
// Every change runs in a transaction so two quick taps can't overwrite each other.
import { doc, onSnapshot, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MAX_ITEM_QUANTITY } from '../config/app';

export const DEFAULT_CART = { items: [], speed: 'saver', verified: false, payment: 'upi' };

const cartRef = (uid) => doc(db, 'carts', uid);

export const subscribeCart = (uid, onChange, onError) =>
  onSnapshot(
    cartRef(uid),
    (snap) => onChange({ ...DEFAULT_CART, ...(snap.exists() ? snap.data() : {}) }),
    onError
  );

const clampQuantity = (qty) => Math.max(0, Math.min(MAX_ITEM_QUANTITY, Math.floor(qty)));

const mutateItems = (uid, mutate) =>
  runTransaction(db, async (tx) => {
    const snap = await tx.get(cartRef(uid));
    const current = snap.exists() ? snap.data() : DEFAULT_CART;
    const items = mutate([...(current.items || [])]).filter((i) => i.quantity > 0);
    tx.set(cartRef(uid), { ...DEFAULT_CART, ...current, items, updatedAt: serverTimestamp() });
  });

export const changeQuantity = (uid, productId, delta) =>
  mutateItems(uid, (items) => {
    const index = items.findIndex((i) => i.id === productId);
    if (index === -1) return delta > 0 ? [...items, { id: productId, quantity: clampQuantity(delta) }] : items;
    items[index] = { ...items[index], quantity: clampQuantity(items[index].quantity + delta) };
    return items;
  });

export const removeItem = (uid, productId) =>
  mutateItems(uid, (items) => items.filter((i) => i.id !== productId));

export const updateCartOptions = (uid, options) =>
  setDoc(cartRef(uid), { ...options, updatedAt: serverTimestamp() }, { merge: true });
