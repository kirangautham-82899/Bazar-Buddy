// users/{uid}: vendor profile, coins and free-delivery credits.
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COINS_FOR_FREE_DELIVERY } from '../config/app';

const userRef = (uid) => doc(db, 'users', uid);

// Creates the profile on first sign-in (also covers accounts made before profiles existed).
export const ensureUserProfile = async (user, extra = {}) => {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    name: extra.name || user.displayName || '',
    phone: extra.phone || '',
    email: user.email || '',
    language: extra.language || 'en',
    coins: 0,
    freeDeliveryCredits: 0,
    savings: 0,
    createdAt: serverTimestamp(),
  });
};

export const subscribeUserProfile = (uid, onChange, onError) =>
  onSnapshot(userRef(uid), (snap) => onChange(snap.exists() ? snap.data() : null), onError);

export const updateUserProfile = (uid, fields) => updateDoc(userRef(uid), fields);

export const redeemFreeDelivery = (uid) =>
  runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef(uid));
    const data = snap.data() || {};
    if ((data.coins || 0) < COINS_FOR_FREE_DELIVERY) throw new Error('not-enough-coins');
    tx.update(userRef(uid), {
      coins: data.coins - COINS_FOR_FREE_DELIVERY,
      freeDeliveryCredits: (data.freeDeliveryCredits || 0) + 1,
    });
    tx.set(doc(collection(db, 'users', uid, 'redemptions')), {
      reward: 'freeDelivery',
      coins: COINS_FOR_FREE_DELIVERY,
      createdAt: serverTimestamp(),
    });
  });

export const subscribeRedemptions = (uid, onChange, onError) =>
  onSnapshot(
    query(collection(db, 'users', uid, 'redemptions'), orderBy('createdAt', 'desc'), limit(20)),
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))),
    onError
  );
