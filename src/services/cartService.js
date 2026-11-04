// Carts hold product ids and quantities only; prices always come from the live catalog.
//   Signed in: carts/{uid} in Firestore (synced across devices, updated in transactions)
//   Guest:     localStorage, merged into the Firestore cart on login
import { doc, onSnapshot, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MAX_ITEM_QUANTITY } from '../config/app';

export const DEFAULT_CART = { items: [], speed: 'saver', payment: 'upi' };

const GUEST_KEY = 'bazarBuddy.cart';

const clampQuantity = (qty) => Math.max(0, Math.min(MAX_ITEM_QUANTITY, Math.floor(qty)));

// Pure: returns new lines with `delta` applied to one product (drops lines at 0).
export const applyQuantityChange = (items, productId, delta, maxQuantity = MAX_ITEM_QUANTITY) => {
  const limit = Math.min(MAX_ITEM_QUANTITY, maxQuantity);
  const existing = items.find((i) => i.id === productId);
  const quantity = Math.min(limit, clampQuantity((existing?.quantity || 0) + delta));
  const others = items.filter((i) => i.id !== productId);
  return quantity > 0 ? (existing ? items.map((i) => (i.id === productId ? { ...i, quantity } : i)) : [...others, { id: productId, quantity }]) : others;
};

// Pure: adds guest lines onto the saved cart.
export const mergeCartLines = (saved, incoming) =>
  incoming.reduce((lines, line) => applyQuantityChange(lines, line.id, line.quantity), saved);

/* Guest cart */
export const readGuestCart = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GUEST_KEY));
    return parsed && Array.isArray(parsed.items) ? { ...DEFAULT_CART, ...parsed } : DEFAULT_CART;
  } catch {
    return DEFAULT_CART;
  }
};

export const writeGuestCart = (cart) => {
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(cart));
  } catch {
    // Storage full or blocked: the cart still works for this visit.
  }
};

export const clearGuestCart = () => {
  try {
    window.localStorage.removeItem(GUEST_KEY);
  } catch {
    // ignore
  }
};

/* Signed-in cart */
const cartRef = (uid) => doc(db, 'carts', uid);

export const subscribeCart = (uid, onChange, onError) =>
  onSnapshot(cartRef(uid), (snap) => onChange({ ...DEFAULT_CART, ...(snap.exists() ? snap.data() : {}) }), onError);

const mutateLines = (uid, mutate) =>
  runTransaction(db, async (tx) => {
    const snap = await tx.get(cartRef(uid));
    const current = { ...DEFAULT_CART, ...(snap.exists() ? snap.data() : {}) };
    tx.set(cartRef(uid), { ...current, items: mutate(current.items), updatedAt: serverTimestamp() });
  });

// A plain write (not a transaction) so Firestore shows it at once, even offline,
// and syncs it in the background.
export const saveCartItems = (uid, items) => setDoc(cartRef(uid), { items, updatedAt: serverTimestamp() }, { merge: true });

export const mergeIntoCart = (uid, lines) => mutateLines(uid, (items) => mergeCartLines(items, lines));

export const updateCartOptions = (uid, options) =>
  setDoc(cartRef(uid), { ...options, updatedAt: serverTimestamp() }, { merge: true });
