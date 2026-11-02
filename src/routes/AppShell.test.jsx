// Renders the real app with Firebase replaced by in-memory fakes: browsing as a
// guest, the cart, orders and the admin gate.
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import starterCatalog from '../data/starterCatalog';

const state = vi.hoisted(() => ({ user: null, isAdmin: false, orders: [], products: [] }));

vi.mock('../config/firebase', () => ({ auth: {}, db: {}, isFirebaseConfigured: true }));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth, cb) => {
    cb(state.user);
    return () => {};
  },
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock('../services/catalogService', () => ({
  subscribeActiveProducts: (cb) => {
    cb(state.products);
    return () => {};
  },
  subscribeAllProducts: (cb) => {
    cb(state.products);
    return () => {};
  },
  saveProduct: vi.fn(),
  importStarterCatalog: vi.fn(),
}));
vi.mock('../services/userService', () => ({
  ensureUserProfile: () => Promise.resolve(),
  subscribeUserProfile: (_uid, cb) => {
    cb({ name: 'Ravi Kumar', phone: '9876543210', address: null });
    return () => {};
  },
  checkIsAdmin: () => Promise.resolve(state.isAdmin),
  updateUserProfile: vi.fn(),
  saveAddress: vi.fn(),
}));
vi.mock('../services/cartService', async (importOriginal) => ({
  ...(await importOriginal()),
  subscribeCart: (_uid, cb) => {
    cb({ items: [], speed: 'saver', payment: 'upi' });
    return () => {};
  },
  changeCartQuantity: vi.fn(() => Promise.resolve()),
  mergeIntoCart: vi.fn(() => Promise.resolve()),
  updateCartOptions: vi.fn(() => Promise.resolve()),
}));
vi.mock('../services/orderService', () => ({
  subscribeMyOrders: (_uid, cb) => {
    cb(state.orders);
    return () => {};
  },
  subscribeAllOrders: (cb) => {
    cb(state.orders);
    return () => {};
  },
  placeOrder: vi.fn(),
  cancelMyOrder: vi.fn(),
  advanceOrder: vi.fn(),
  adminCancelOrder: vi.fn(),
}));

const products = starterCatalog.map((p) => ({ ...p, stock: 20 }));

beforeAll(() => {
  // jsdom has no IntersectionObserver; framer-motion's in-view animations use it.
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.scrollTo = () => {};
});

beforeEach(() => {
  window.localStorage.clear();
  Object.assign(state, { user: null, isAdmin: false, orders: [], products });
});

const renderAt = (path) => {
  window.history.pushState({}, '', path);
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

const WAIT = { timeout: 8000 };

describe('shop (guest)', () => {
  it('browses categories and adds to the cart without logging in', async () => {
    renderAt('/shop');
    expect(await screen.findByRole('heading', { name: 'Shop by category' }, WAIT)).toBeInTheDocument();
    const tomatoCard = (await screen.findAllByRole('article')).find((a) => within(a).queryByText('Tomatoes'));
    fireEvent.click(within(tomatoCard).getByRole('button', { name: 'Add Tomatoes' }));
    expect(await screen.findByText('1 item')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('bazarBuddy.cart')).items).toEqual([{ id: 'tomato', quantity: 1 }]);
  });

  it('shows a friendly message while the catalog is empty', async () => {
    state.products = [];
    renderAt('/shop');
    expect(await screen.findByText('Our shelves are being stocked', {}, WAIT)).toBeInTheDocument();
  });

  it('asks a guest to log in at checkout', async () => {
    window.localStorage.setItem('bazarBuddy.cart', JSON.stringify({ items: [{ id: 'onion', quantity: 2 }], speed: 'saver', payment: 'upi' }));
    renderAt('/cart');
    expect(await screen.findByRole('link', { name: 'Log in to place order' }, WAIT)).toHaveAttribute('href', '/auth?next=/cart');
    expect(screen.getByText('Onions')).toBeInTheDocument();
  });

  it('sends guests from Orders to login and back', async () => {
    renderAt('/orders');
    expect(await screen.findByRole('heading', { name: 'Welcome back' }, WAIT)).toBeInTheDocument();
    expect(window.location.search).toBe('?next=%2Forders');
  });
});

describe('signed in', () => {
  beforeEach(() => {
    state.user = { uid: 'vendor-1', email: 'ravi@example.com', displayName: 'Ravi Kumar' };
  });

  it('lists orders with their live status', async () => {
    state.orders = [
      {
        id: 'order-abc123',
        uid: 'vendor-1',
        items: [{ id: 'tomato', name: 'Tomatoes', unit: 'kg', price: 30, quantity: 5 }],
        total: 180,
        speed: 'express',
        payment: 'upi',
        status: 'packed',
        createdAt: new Date(),
      },
    ];
    renderAt('/orders');
    expect(await screen.findByText('Order #ABC123', {}, WAIT)).toBeInTheDocument();
    expect(screen.getAllByText('Packed').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument();
  });

  it('keeps non-admins out of the admin panel', async () => {
    renderAt('/admin');
    expect(await screen.findByRole('heading', { name: 'Admins only' }, WAIT)).toBeInTheDocument();
  });

  it('shows admins the product list', async () => {
    state.isAdmin = true;
    renderAt('/admin/products');
    expect(await screen.findByRole('button', { name: /Add product/ }, WAIT)).toBeInTheDocument();
    expect(await screen.findByText('Mustard oil', {}, WAIT)).toBeInTheDocument();
  });
});
