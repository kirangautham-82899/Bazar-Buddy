// Renders the real app with Firebase replaced by in-memory fakes: browsing as a
// guest, the cart, orders and the admin gate.
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import starterCatalog from '../data/starterCatalog';
import { saveCartItems } from '../services/cartService';

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
  saveCartItems: vi.fn(() => Promise.resolve()),
  mergeIntoCart: vi.fn(() => Promise.resolve()),
  updateCartOptions: vi.fn(() => Promise.resolve()),
}));
vi.mock('../services/marketService', () => ({
  findPlace: vi.fn(async () => ({ lat: 12.9627, lng: 77.5806, label: 'Bangalore City, Bangalore', district: 'Bangalore', state: 'Karnataka', precision: 'pin' })),
  fetchNearbyMarkets: vi.fn(async () => ({
    markets: [
      {
        id: 'osm-node-1',
        name: 'HOPCOMS',
        kind: 'greengrocer',
        lat: 12.9651,
        lng: 77.5812,
        area: '',
        hours: '24/7',
        schedule: Array.from({ length: 7 }, () => [[0, 1440]]),
        phone: '+91 80 2222 3333',
      },
      { id: 'osm-node-2', name: 'Far Away Market', kind: 'market', lat: 13.2, lng: 77.58, area: '', hours: '' },
    ],
  })),
  fetchMandiPrices: vi.fn(async () => ({ configured: false, scope: null, records: [] })),
  currentPosition: vi.fn(),
}));
vi.mock('../services/assistantService', () => ({
  askAssistant: vi.fn(async () => ({ reply: 'Track it under **My orders**: [Open orders](/orders)\n- Valiya Angadi, 1.5 km' })),
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
  window.__desktop = false;
  window.localStorage.clear();
  window.sessionStorage.clear();
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

  it('steps a quantity up and back down to Add', async () => {
    renderAt('/shop');
    await screen.findByRole('heading', { name: 'Shop by category' }, WAIT);
    const card = () => screen.getAllByRole('article').find((a) => within(a).queryByText('Tomatoes'));
    fireEvent.click(within(card()).getByRole('button', { name: 'Add Tomatoes' }));
    fireEvent.click(await within(card()).findByRole('button', { name: 'Increase quantity of Tomatoes' }));
    await within(card()).findByText('2');
    fireEvent.click(within(card()).getByRole('button', { name: 'Decrease quantity of Tomatoes' }));
    await within(card()).findByText('1');
    fireEvent.click(within(card()).getByRole('button', { name: 'Decrease quantity of Tomatoes' }));
    expect(await within(card()).findByRole('button', { name: 'Add Tomatoes' })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('bazarBuddy.cart')).items).toEqual([]);
    fireEvent.click(within(card()).getByRole('button', { name: 'Add Tomatoes' }));
    await within(card()).findByText('1');
  });

  it('opens product details from a card', async () => {
    renderAt('/shop');
    fireEvent.click(await screen.findByRole('button', { name: 'View details of Paneer' }, WAIT));
    expect(await screen.findByRole('dialog', { name: 'Paneer' })).toBeInTheDocument();
    expect(screen.getByText('Soft fresh paneer, made daily.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
  });

  it("lists today's deals by biggest discount", async () => {
    renderAt('/shop');
    const deals = (await screen.findByRole('heading', { name: 'Today’s deals' }, WAIT)).closest('section');
    // Tomatoes: ₹30 vs ₹36 MRP = 17% off, the biggest discount in the starter catalog.
    expect(within(deals).getAllByRole('article')[0]).toHaveTextContent('Tomatoes');
  });

  it('uses the phone layout on small screens', async () => {
    renderAt('/shop');
    expect(await screen.findByRole('navigation', { name: 'Quick links' }, WAIT)).toHaveTextContent('Markets');
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shop by category' })).toBeInTheDocument();
  });

  it('uses the desktop layout on wide screens', async () => {
    window.__desktop = true;
    renderAt('/shop');
    expect(await screen.findByRole('link', { name: /^Cart:/ }, WAIT)).toBeInTheDocument();
    // Side navbar: main sections and every category.
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveTextContent('Markets');
    expect(screen.getByRole('navigation', { name: 'Categories' })).toHaveTextContent('Vegetables');
    expect(screen.queryByRole('heading', { name: 'Shop by category' })).not.toBeInTheDocument();
    expect(document.querySelector('.bottom-nav')).toBeNull();
  });

  it('finds only markets near a PIN code', async () => {
    renderAt('/markets?item=Tomato');
    fireEvent.change(await screen.findByLabelText('PIN code or area', {}, WAIT), { target: { value: '560002' } });
    fireEvent.click(screen.getByRole('button', { name: 'Find markets' }));
    expect(await screen.findByRole('heading', { name: 'Markets near Bangalore City, Bangalore' })).toBeInTheDocument();
    expect(await screen.findByText('HOPCOMS')).toBeInTheDocument();
    expect(screen.getByText('K.R. Market')).toBeInTheDocument(); // directory mandi, ~0.4 km away
    expect(screen.queryByText('Far Away Market')).not.toBeInTheDocument(); // ~26 km, outside the 5 km default
    expect(screen.getByText(/centre of the PIN code area/)).toBeInTheDocument();
    // Timings and contact for mapped shops; directory mandis have none listed.
    const hopcoms = screen.getByText('HOPCOMS').closest('li');
    expect(hopcoms.querySelector('.market-status')).toHaveTextContent('Open 24 hours');
    expect(within(hopcoms).getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:+918022223333');
    expect(within(screen.getByText('K.R. Market').closest('li')).getByText('Timings not listed')).toBeInTheDocument();
    // Open now keeps only markets known to be open.
    fireEvent.click(screen.getByRole('button', { name: 'Open now' }));
    expect(await screen.findByText('1 open now within 5 km')).toBeInTheDocument();
    expect(screen.queryByText('K.R. Market')).not.toBeInTheDocument();
    expect(await screen.findByText(/Live daily mandi prices will appear here/)).toBeInTheDocument();
  });

  it('answers questions in the chat assistant with in-app links', async () => {
    renderAt('/shop');
    fireEvent.click(await screen.findByRole('button', { name: 'Ask Bazar Buddy' }, WAIT));
    const chat = await screen.findByRole('dialog', { name: 'Bazar Buddy assistant' });
    fireEvent.click(within(chat).getByRole('button', { name: 'How do I track my order?' }));
    expect(await within(chat).findByText('My orders')).toBeInTheDocument();
    expect(within(chat).getByRole('link', { name: 'Open orders' })).toHaveAttribute('href', '/orders');
    expect(within(chat).getByText('Valiya Angadi, 1.5 km').tagName).toBe('LI');
    fireEvent.click(within(chat).getByRole('button', { name: 'Close' }));
    expect(await screen.findByRole('button', { name: 'Ask Bazar Buddy' })).toBeInTheDocument();
  });

  it('opens the assistant from the side navbar on desktop', async () => {
    window.__desktop = true;
    renderAt('/shop');
    expect(await screen.findByRole('link', { name: /^Cart:/ }, WAIT)).toBeInTheDocument();
    expect(document.querySelector('.assistant-fab')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Ask Bazar Buddy/ }));
    expect(await screen.findByRole('dialog', { name: 'Bazar Buddy assistant' })).toBeInTheDocument();
  });

  it('opens the side menu on phones', async () => {
    renderAt('/shop');
    fireEvent.click(await screen.findByRole('button', { name: 'Menu' }, WAIT));
    const drawer = await screen.findByRole('dialog', { name: 'Menu' });
    expect(within(drawer).getByRole('link', { name: /Markets/ })).toHaveAttribute('href', '/markets');
    // The menu also opens the assistant, closing itself first.
    fireEvent.click(within(drawer).getByRole('button', { name: /Ask Bazar Buddy/ }));
    expect(await screen.findByRole('dialog', { name: 'Bazar Buddy assistant' })).toBeInTheDocument();
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

  it('updates the cart at once on each tap and saves it in the background', async () => {
    renderAt('/shop');
    await screen.findByRole('heading', { name: 'Shop by category' }, WAIT);
    const card = () => screen.getAllByRole('article').find((a) => within(a).queryByText('Tomatoes'));
    fireEvent.click(within(card()).getByRole('button', { name: 'Add Tomatoes' }));
    const plus = await within(card()).findByRole('button', { name: 'Increase quantity of Tomatoes' });
    fireEvent.click(plus);
    fireEvent.click(plus); // quick taps build on each other
    await within(card()).findByText('3');
    expect(saveCartItems).toHaveBeenLastCalledWith('vendor-1', [{ id: 'tomato', quantity: 3 }]);
    fireEvent.click(within(card()).getByRole('button', { name: 'Decrease quantity of Tomatoes' }));
    await within(card()).findByText('2');
    expect(saveCartItems).toHaveBeenLastCalledWith('vendor-1', [{ id: 'tomato', quantity: 2 }]);
  });

  it('offers products from past orders under Buy again', async () => {
    state.orders = [{ id: 'o1', uid: 'vendor-1', items: [{ id: 'garlic', name: 'Garlic', unit: 'kg', price: 120, quantity: 2 }], total: 240, speed: 'saver', payment: 'cod', status: 'delivered', createdAt: new Date() }];
    renderAt('/shop');
    const row = (await screen.findByRole('heading', { name: 'Buy again' }, WAIT)).closest('section');
    expect(within(row).getByText('Garlic')).toBeInTheDocument();
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
