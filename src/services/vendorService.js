// Community data around vendor groups:
//   vendorGroups/{groupId}/reviews/{auto}       one doc per review
//   vendorGroups/{groupId}/joinRequests/{uid}   doc id = uid, so one request per vendor
//   barters/{auto}                               open barter offers
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const withEstimates = (snap) =>
  snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));

export const subscribeReviews = (groupId, onChange, onError) =>
  onSnapshot(
    query(collection(db, 'vendorGroups', groupId, 'reviews'), orderBy('createdAt', 'desc'), limit(20)),
    (snap) => onChange(withEstimates(snap)),
    onError
  );

export const addReview = (groupId, user, rating, text) =>
  addDoc(collection(db, 'vendorGroups', groupId, 'reviews'), {
    uid: user.uid,
    name: user.displayName || '',
    rating,
    text: text.trim().slice(0, 300),
    createdAt: serverTimestamp(),
  });

export const hasRequestedToJoin = async (groupId, uid) =>
  (await getDoc(doc(db, 'vendorGroups', groupId, 'joinRequests', uid))).exists();

export const requestToJoin = (groupId, user) =>
  setDoc(doc(db, 'vendorGroups', groupId, 'joinRequests', user.uid), {
    uid: user.uid,
    name: user.displayName || '',
    createdAt: serverTimestamp(),
  });

export const subscribeBarters = (onChange, onError) =>
  onSnapshot(
    query(collection(db, 'barters'), orderBy('createdAt', 'desc'), limit(20)),
    (snap) => onChange(withEstimates(snap)),
    onError
  );

export const addBarter = (user, offer, request) =>
  addDoc(collection(db, 'barters'), {
    uid: user.uid,
    name: user.displayName || '',
    offer: offer.trim().slice(0, 80),
    request: request.trim().slice(0, 80),
    createdAt: serverTimestamp(),
  });

export const deleteBarter = (barterId) => deleteDoc(doc(db, 'barters', barterId));
