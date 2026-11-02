// users/{uid}: name, phone, email, address, createdAt
// admins/{uid}: exists for team members (created by hand in the Firebase console)
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhone } from '../utils/validation';

const userRef = (uid) => doc(db, 'users', uid);

// Creates the profile on first sign-in (also covers accounts made before profiles existed).
export const ensureUserProfile = async (user, extra = {}) => {
  const snap = await getDoc(userRef(user.uid));
  if (snap.exists()) return;
  await setDoc(userRef(user.uid), {
    name: extra.name || user.displayName || '',
    phone: extra.phone || '',
    email: user.email || '',
    address: null,
    createdAt: serverTimestamp(),
  });
};

export const subscribeUserProfile = (uid, onChange, onError) =>
  onSnapshot(userRef(uid), (snap) => onChange(snap.exists() ? snap.data() : null), onError);

export const updateUserProfile = (uid, fields) => updateDoc(userRef(uid), fields);

export const saveAddress = (uid, address) =>
  updateDoc(userRef(uid), {
    address: {
      name: address.name.trim(),
      phone: normalizePhone(address.phone),
      line1: address.line1.trim(),
      area: address.area.trim(),
      city: address.city.trim(),
      pincode: address.pincode.trim(),
    },
  });

export const checkIsAdmin = async (uid) => {
  try {
    return (await getDoc(doc(db, 'admins', uid))).exists();
  } catch {
    return false;
  }
};
