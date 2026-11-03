// Signing out also forgets everything this device kept for the account, so
// the next person on a shared phone sees none of it: Firestore's offline copy
// (profile, address, orders, cart), the chat history and the saved cart.
import { signOut } from 'firebase/auth';
import { clearIndexedDbPersistence, terminate } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const DEVICE_KEYS = ['bazarBuddy.cart', 'bazarBuddy.assistant'];

export const forgetDeviceData = () => {
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      DEVICE_KEYS.forEach((key) => store.removeItem(key));
    } catch {
      // Storage blocked: nothing was saved there.
    }
  }
};

export const signOutAndForget = async () => {
  await signOut(auth);
  forgetDeviceData();
  try {
    // The offline cache can only be cleared once Firestore is shut down.
    await terminate(db);
    await clearIndexedDbPersistence(db);
  } catch (err) {
    console.error(err);
  }
  // Firestore can't be restarted in this page, so start fresh.
  window.location.assign('/shop');
};
