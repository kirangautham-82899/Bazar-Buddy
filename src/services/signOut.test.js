const fb = vi.hoisted(() => ({ signOut: vi.fn(async () => {}), terminate: vi.fn(async () => {}), clear: vi.fn(async () => {}) }));

vi.mock('../config/firebase', () => ({ auth: { name: 'auth' }, db: { name: 'db' } }));
vi.mock('firebase/auth', () => ({ signOut: fb.signOut }));
vi.mock('firebase/firestore', () => ({ terminate: fb.terminate, clearIndexedDbPersistence: fb.clear }));

import { signOutAndForget } from './signOut';

describe('signOutAndForget', () => {
  it('signs out and wipes everything the device kept for the account', async () => {
    window.localStorage.setItem('bazarBuddy.cart', '{"items":[{"id":"tomato","quantity":2}]}');
    window.sessionStorage.setItem('bazarBuddy.assistant', '{"location":{"lat":10.78,"lng":76.65}}');
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });

    await signOutAndForget();

    expect(fb.signOut).toHaveBeenCalled();
    expect(fb.terminate).toHaveBeenCalledBefore(fb.clear);
    expect(fb.clear).toHaveBeenCalledWith({ name: 'db' });
    expect(window.localStorage.getItem('bazarBuddy.cart')).toBeNull();
    expect(window.sessionStorage.getItem('bazarBuddy.assistant')).toBeNull();
    expect(assign).toHaveBeenCalledWith('/shop');
    vi.unstubAllGlobals();
  });
});
