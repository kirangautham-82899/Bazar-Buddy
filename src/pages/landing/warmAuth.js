import { loadAppShell, loadAuthPage, loadShopHome, loadShopLayout } from '../../routes/lazy';

// Start fetching the shop and login screens as soon as a finger or cursor heads for a link to them.
const warmApp = () => [loadAppShell, loadShopLayout, loadShopHome, loadAuthPage].forEach((load) => load().catch(() => {}));

// Spread onto any <Link> that leads into the app.
export const warmAuthProps = { onPointerEnter: warmApp, onFocus: warmApp, onTouchStart: warmApp };
