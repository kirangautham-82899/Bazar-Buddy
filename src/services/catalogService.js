// products/{productId}: the live catalog. Anyone can read it; only admins write.
//   name, category, unit, price, mrp?, stock, active, icon, keywords[], description, sortOrder
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import starterCatalog from '../data/starterCatalog';

const productsRef = () => collection(db, 'products');

const bySortOrder = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);

const toProducts = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(bySortOrder);

// Shop view: only products marked visible.
export const subscribeActiveProducts = (onChange, onError) =>
  onSnapshot(query(productsRef(), where('active', '==', true)), (snap) => onChange(toProducts(snap)), onError);

// Admin view: everything, including hidden products.
export const subscribeAllProducts = (onChange, onError) =>
  onSnapshot(productsRef(), (snap) => onChange(toProducts(snap)), onError);

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const cleanProduct = ({ name, category, unit, price, mrp, stock, active, icon, keywords, description, sortOrder }) => ({
  name: name.trim(),
  category,
  unit,
  price: Number(price),
  mrp: mrp ? Number(mrp) : null,
  stock: Math.max(0, Math.floor(Number(stock) || 0)),
  active: Boolean(active),
  icon: icon || '',
  keywords: (keywords || []).map((k) => k.trim().toLowerCase()).filter(Boolean),
  description: (description || '').trim().slice(0, 300),
  sortOrder: Number(sortOrder) || 0,
});

export const saveProduct = (product) => {
  const id = product.id || `${slugify(product.name)}-${Date.now().toString(36)}`;
  return setDoc(doc(db, 'products', id), { ...cleanProduct(product), updatedAt: serverTimestamp() }, { merge: true }).then(() => id);
};

export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

// One-time helper for a fresh project: fills the shop with stocked products to edit later.
export const importStarterCatalog = async () => {
  const batch = writeBatch(db);
  starterCatalog.forEach(({ id, ...product }) => {
    batch.set(doc(db, 'products', id), { ...cleanProduct(product), updatedAt: serverTimestamp() });
  });
  await batch.commit();
  return starterCatalog.length;
};
