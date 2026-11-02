// Renders every dashboard tab with Firebase replaced by in-memory fakes, so a
// crash or missing translation on any screen fails the test run.
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

const mockUser = { uid: 'vendor-1', email: 'ravi@example.com', displayName: 'Ravi Kumar' };
const mockProfile = { name: 'Ravi Kumar', phone: '9876543210', coins: 36, freeDeliveryCredits: 1, savings: 120 };
const mockOrder = {
  id: 'order-abc123',
  uid: 'vendor-1',
  items: [{ id: 'tomato', name: { en: 'Tomatoes', hi: 'टमाटर' }, price: 30, unit: 'kg', quantity: 5 }],
  speed: 'express',
  payment: 'upi',
  otp: '4821',
  total: 180,
  status: 'placed',
  createdAt: new Date(),
};

vi.mock('../../config/firebase', () => ({ auth: {}, db: {}, isFirebaseConfigured: true }));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth, cb) => {
    cb(mockUser);
    return () => {};
  },
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock('../../services/userService', () => ({
  ensureUserProfile: () => Promise.resolve(),
  subscribeUserProfile: (_uid, cb) => {
    cb(mockProfile);
    return () => {};
  },
  subscribeRedemptions: (_uid, cb) => {
    cb([]);
    return () => {};
  },
  updateUserProfile: vi.fn(),
  redeemFreeDelivery: vi.fn(),
}));
vi.mock('../../services/cartService', () => ({
  DEFAULT_CART: { items: [], speed: 'saver', verified: false, payment: 'upi' },
  subscribeCart: (_uid, cb) => {
    cb({ items: [{ id: 'onion', quantity: 2 }], speed: 'express', verified: true, payment: 'upi' });
    return () => {};
  },
  changeQuantity: vi.fn(() => Promise.resolve()),
  removeItem: vi.fn(() => Promise.resolve()),
  updateCartOptions: vi.fn(() => Promise.resolve()),
}));
vi.mock('../../services/orderService', () => ({
  subscribeOrders: (_uid, cb) => {
    cb([mockOrder]);
    return () => {};
  },
  placeOrder: vi.fn(),
  cancelOrder: vi.fn(),
}));
vi.mock('../../services/vendorService', () => ({
  subscribeBarters: (cb) => {
    cb([]);
    return () => {};
  },
  subscribeReviews: (_g, cb) => {
    cb([]);
    return () => {};
  },
  addBarter: vi.fn(),
  deleteBarter: vi.fn(),
  addReview: vi.fn(),
  hasRequestedToJoin: () => Promise.resolve(false),
  requestToJoin: vi.fn(),
}));
// Leaflet needs a real browser layout engine.
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}));
vi.mock('leaflet', () => ({ default: { divIcon: () => ({}) } }));

beforeAll(() => {
  // jsdom has no IntersectionObserver or matchMedia; framer-motion uses both.
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
});

beforeEach(() => window.localStorage.setItem('bazarBuddy.language', 'en'));

const renderAt = (path) => {
  window.history.pushState({}, '', path);
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('dashboard tabs', () => {
  it('home greets the vendor and shows the active order', async () => {
    renderAt('/dashboard');
    expect(await screen.findByText('Namaste, Ravi')).toBeInTheDocument();
    expect(await screen.findByText('Order #ABC123')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('market lists products, the cart and order history', async () => {
    renderAt('/dashboard/market');
    expect(await screen.findByRole('heading', { name: 'Market' })).toBeInTheDocument();
    expect(screen.getAllByText('Tomatoes').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Your cart' })).toBeInTheDocument();
    expect(screen.getByText('Delivery OTP: 4821')).toBeInTheDocument();
  });

  it('wallet, trade, profile and help render', async () => {
    const { unmount } = renderAt('/dashboard/wallet');
    expect(await screen.findByRole('heading', { name: 'Your wallet' }, { timeout: 4000 })).toBeInTheDocument();
    unmount();

    const trade = renderAt('/dashboard/trade');
    expect(await screen.findByTestId('map', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Community barter' })).toBeInTheDocument();
    trade.unmount();

    const profile = renderAt('/dashboard/profile');
    expect(await screen.findByText('ravi@example.com', { selector: 'p' }, { timeout: 4000 })).toBeInTheDocument();
    profile.unmount();

    renderAt('/dashboard/help');
    expect(await screen.findByRole('heading', { name: 'Help & support' }, { timeout: 4000 })).toBeInTheDocument();
  });

  it('switches every tab to Hindi', async () => {
    window.localStorage.setItem('bazarBuddy.language', 'hi');
    renderAt('/dashboard');
    await waitFor(() => expect(screen.getByText('नमस्ते, Ravi')).toBeInTheDocument());
    expect(screen.getByText('होम')).toBeInTheDocument();
  });
});
