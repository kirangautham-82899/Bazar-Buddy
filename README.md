<div align="center">

# 🛒 Bazar Buddy

### Quick wholesale delivery of vegetables and groceries for street vendors

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel"/>
</p>

</div>

## Overview

Bazar Buddy is an Instamart-style quick-commerce store for street vendors across India: browse live prices and stock, fill a cart, check out with a delivery address and track the order to the stall. The team runs the catalog and moves orders along from a built-in admin panel.

## What's inside

| For | What it does |
|---|---|
| **Anyone** | `/shop`: search (typed or spoken, English and Hinglish like *pyaz*, *aloo*), Today's deals, a row per category, a category browser with a side rail, and a product detail view (tap any product). No account needed to browse; the cart is saved on the device. |
| **Phones vs desktop** | Phones (< 1024 px): compact header, bottom tab bar, floating "View cart" bar, swipeable product rows. Desktop: one wide top bar with address, live search, links and a cart button showing items and total, a category link row, 6-column product grids, and a two-column cart with the bill pinned on the right. |
| **Shoppers** | Checkout with delivery speed (express 45 min / early morning / saver), delivery address, UPI (QR with the exact amount) or cash on delivery, free-delivery threshold. Orders page with live status (placed → confirmed → packed → out for delivery → delivered), cancel before packing, order again, and a "Buy again" row on the shop home. Account page with profile, address, help and FAQ. A guest cart merges into the account on login. |
| **Team (admins)** | `/admin`: live order queue with status filters and one-tap next step; confirming re-checks prices and deducts stock, cancelling a confirmed order restocks. Products: add/edit name, category, unit, price, MRP, stock, description, search keywords, icon, sort order; show/hide; one-click starter catalog (24 products, 50 in stock each) for a new project. |
| **Everyone** | Landing page pre-rendered for search engines, JSON-LD, sitemap, fast loading (Firebase never loads on the landing page), mandi colour palette, motion that respects reduce-motion, no image files. |

## Tech stack

React 19 · Vite 6 · React Router 7 · Firebase Auth + Cloud Firestore (offline cache) · Framer Motion · React Icons · qrcode.react · Vitest + Testing Library · ESLint · Vercel

## Project structure

```text
Bazar-Buddy/
├── firebase/                     # firestore.rules, firestore.indexes.json
├── public/                       # manifest, icons, robots.txt, share image
├── scripts/prerender.js          # writes landing HTML, JSON-LD and sitemap.xml into dist/
├── src/
│   ├── main.jsx / entry-server.jsx / App.jsx
│   ├── routes/                   # AppShell (providers + routes), RouteGuards, lazy loaders
│   ├── content/strings.js        # all copy (English)
│   ├── config/                   # firebase.js, app.js (delivery fees, free-delivery threshold)
│   ├── context/                  # Auth (+ admin flag), Catalog (live products), Cart (guest + account), Toast
│   ├── services/                 # Firestore: catalog, cart, orders, users
│   ├── data/                     # categories, starter catalog (for the admin import)
│   ├── features/
│   │   ├── shop/                 # layout, header, home, category, search, product card, cart bar
│   │   ├── cart/                 # cart + checkout, address form, order-placed modal
│   │   ├── orders/               # orders page, tracker
│   │   ├── account/              # profile, address, help
│   │   └── admin/                # orders queue, products, product form
│   ├── pages/                    # landing (sections + content.js), auth
│   ├── components/               # common (Modal, ProductIcon, BrandMark…) and motion
│   ├── hooks/ · seo/ · styles/ · utils/
└── index.html · vite.config.js · vercel.json · firebase.json
```

### Routes

| Path | Screen | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/shop`, `/shop/category/:id`, `/shop/search?q=` | Shop | Public |
| `/cart` | Cart and checkout | Public (login to order) |
| `/orders`, `/account` | Orders, account | Signed in |
| `/admin`, `/admin/products` | Admin panel | Admins |
| `/auth?next=` | Login / register, then back to `next` | Public |

### Firestore data model

| Collection | Contents | Access |
|---|---|---|
| `products/{id}` | name, category, unit, price, mrp, stock, active, icon, keywords, description, sortOrder | Read: anyone · Write: admins |
| `users/{uid}` | name, phone, email, address | Owner, admins can read |
| `carts/{uid}` | items `[{id, quantity}]`, speed, payment | Owner |
| `orders/{id}` | customer, address, items (price snapshot), totals, speed, payment, status, statusHistory | Owner reads and can cancel before packing · Admins read and update status |
| `admins/{uid}` | marks a team member | Read own · no writes from the app |

Prices in the cart always come from the live catalog. `placeOrder` re-reads every product inside a transaction and rejects sold-out items; confirming in the admin panel re-checks the total against current prices before deducting stock.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase web config
npm run dev
```

Or pull the config straight from Vercel: `npx vercel env pull .env.development.local --environment production`.

### Firebase setup

1. Enable **Authentication → Email/Password** and create a **Firestore** database.
2. Deploy the rules and indexes: `npx firebase-tools deploy --only firestore --project <your-project-id>`.
3. **Make yourself an admin:** register in the app, copy your user UID from Authentication → Users, then in Firestore create a document `admins/<that UID>` (any field, e.g. `role: "owner"`).
4. Open `/admin/products`, click **Import starter catalog** (or add products by hand), then adjust prices and stock. Imported products start with 50 in stock; products at 0 show as out of stock.

Optional variables: `REACT_APP_UPI_ID`, `REACT_APP_SUPPORT_PHONE`, `REACT_APP_TOLL_FREE`, `REACT_APP_SITE_URL`.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server on http://localhost:3000 |
| `npm test` / `npm run test:ci` | Vitest (watch / once) |
| `npm run lint` | ESLint |
| `npm run build` | Production build in `dist/`, pre-renders the landing page and writes `sitemap.xml` |
| `npm run preview` | Serve the production build locally |

## Deployment (Vercel)

Every push to `main` deploys to production at https://bazar-buddy-neon.vercel.app; other branches get preview links. `vercel.json` sets the Vite preset, SPA rewrites and long-term cache headers for hashed assets. Firestore rules are deployed separately with the Firebase CLI (step 2 above) whenever `firebase/firestore.rules` changes.

## Getting found on Google

The site is verified in Google Search Console (`public/googlef7f218449ee0b5a0.html`, keep this file). Submit `sitemap.xml` there, consider a custom domain, and build links from vendor associations and directories. Searches for "Bazar Buddy" should show the site first once indexed; generic terms take time.

## Before handling real money

- **UPI payments are not verified automatically.** Staff check the payment before confirming. Add a payment gateway (e.g. Razorpay) with server-side verification.
- **Orders are written by the shopper's device.** The admin "Confirm" step re-checks prices and stock, so a tampered order cannot be confirmed; moving order placement into a Cloud Function (Blaze plan) would reject it outright.
- **Delivery times are estimates** from the chosen speed; there is no rider tracking yet.

## License

MIT
