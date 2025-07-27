// src/utils/firebaseCart.js

import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

/**
 * Add a new item to the cart in Firebase
 */
export const addToFirebaseCart = async (uid, item) => {
  const cartRef = doc(db, 'carts', uid);
  const docSnap = await getDoc(cartRef);
  let items = [];

  if (docSnap.exists()) {
    items = docSnap.data().items || [];
  }

  const existingIndex = items.findIndex((i) => i.id === item.id);
  if (existingIndex !== -1) {
    items[existingIndex].quantity += 1;
  } else {
    items.push({ ...item, quantity: 1 });
  }

  await setDoc(cartRef, { items });
};

/**
 * Remove item from Firebase cart
 */
export const removeFromFirebaseCart = async (uid, itemId) => {
  const cartRef = doc(db, 'carts', uid);
  const docSnap = await getDoc(cartRef);

  if (!docSnap.exists()) return;

  const items = docSnap.data().items || [];
  const updatedItems = items.filter((item) => item.id !== itemId);

  await setDoc(cartRef, { items: updatedItems });
};

/**
 * Update quantity of a cart item
 */
export const updateFirebaseCartItem = async (uid, itemId, newQty) => {
  const cartRef = doc(db, 'carts', uid);
  const docSnap = await getDoc(cartRef);
  if (!docSnap.exists()) return;

  let items = docSnap.data().items || [];
  items = items.map((item) =>
    item.id === itemId ? { ...item, quantity: newQty } : item
  );

  await setDoc(cartRef, { items });
};

/**
 * Fetch cart from Firebase
 */
export const fetchCartFromFirebase = async (uid, setCart) => {
  const cartRef = doc(db, 'carts', uid);
  const docSnap = await getDoc(cartRef);

  if (docSnap.exists()) {
    setCart(docSnap.data().items || []);
  } else {
    setCart([]);
  }
};
