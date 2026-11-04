<div align="center">

# 🛒 Bazar Buddy

### Wholesale vegetables and groceries, delivered to street vendors

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel"/>
</p>

**[bazar-buddy-neon.vercel.app](https://bazar-buddy-neon.vercel.app)**

</div>

## About

Bazar Buddy is a quick-commerce app for street vendors across India. Vendors order fresh vegetables, fruits, grains and kitchen staples for their stalls, pay by UPI or cash on delivery, and track each order to their door. It also helps them find wholesale and vegetable markets nearby, check today's wholesale prices, and get quick answers from a built-in AI assistant.

## Features

### Shopping
- Browse by category, see today's deals, and search by typing or speaking (small spelling mistakes are fine).
- Product details, live prices and stock, and a cart that works without an account.
- Checkout with three delivery speeds (express in 45 minutes, early morning, saver), a saved delivery address, and free delivery above ₹500.
- Pay by UPI (QR code with the exact amount) or cash on delivery.

### Orders and account
- Live order tracking: placed, confirmed, packed, out for delivery, delivered.
- Cancel before packing, order again in one tap, and a "Buy again" row on the home page.
- Profile, delivery address, help and FAQ in one place.

### Local markets
- Nearby wholesale markets, vegetable markets and grocers from your location or PIN code, nearest first.
- Opening hours with "open now" status, phone numbers and directions, in a table.
- Today's wholesale prices from the government's Agmarknet feed.

### AI assistant
- "Ask Bazar Buddy" answers questions about nearby markets, prices and how to use the app, with links straight to the right page.

### Admin panel
- Live order queue with status filters and one-tap next step.
- Add, edit, hide and restock products, or import a 24-product starter catalog in one click.

### Design
- Pastel vegetable palette, a clean full-width desktop layout and a phone layout with a bottom tab bar.
- Fast landing page, pre-rendered for search engines, with motion that respects reduced-motion settings.

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React 19, Vite 6, React Router 7, Framer Motion, React Icons |
| Data and login | Firebase Authentication, Cloud Firestore |
| Server functions | Vercel Functions (Node.js) |
| Maps and places | Google Places API, OpenStreetMap |
| Prices | data.gov.in (Agmarknet) |
| AI assistant | Google Gemini |
| Testing | Vitest, Testing Library, ESLint |
| Hosting | Vercel |

## Project structure

```text
Bazar-Buddy/
├── api/                  # server functions: places, nearby markets, prices, assistant
├── firebase/             # Firestore configuration
├── public/               # icons, manifest, robots.txt
├── scripts/              # landing page pre-rendering and sitemap
└── src/
    ├── features/
    │   ├── shop/         # header, home, categories, search, products
    │   ├── cart/         # cart and checkout
    │   ├── orders/       # orders and tracking
    │   ├── account/      # profile, address, help
    │   ├── markets/      # local markets and prices
    │   ├── assistant/    # AI chat
    │   └── admin/        # order queue and products
    ├── pages/            # landing page and login
    ├── components/       # shared UI and motion
    ├── context/          # login, catalog, cart, notifications
    ├── services/         # data access
    ├── content/          # all app text
    └── styles/           # design tokens and global styles
```

## Running locally

```bash
npm install
npm run dev
```

| Command | Purpose |
|---|---|
| `npm run dev` | Start the app at http://localhost:3000 |
| `npm test` | Run the tests |
| `npm run lint` | Check the code |
| `npm run build` | Build for production |

## License

MIT
