import { loadAppShell, loadAuthPage } from '../../routes/lazy';

// Start fetching the login screen as soon as a finger or cursor heads for a link to it.
const warmAuth = () => {
  loadAppShell().catch(() => {});
  loadAuthPage().catch(() => {});
};

// Spread onto any <Link> that leads to /auth.
export const warmAuthProps = { onPointerEnter: warmAuth, onFocus: warmAuth, onTouchStart: warmAuth };
