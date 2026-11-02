<div align="center">

# 🛒 Bazar Buddy

### Fresh raw material at fair prices for every street vendor

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

</div>

## Overview

Bazar Buddy is a mobile-first marketplace for street vendors. Vendors search for raw material in **English, Hindi or Hinglish (also by voice)**, see whether a price is fair compared with nearby suppliers, place orders and follow their progress, earn reward coins, and trade spare stock with vendor groups nearby.

## Features

| Feature | What it does |
|---|---|
| 🌐 **English & Hindi** | Every screen is translated. The language picked at the start is kept everywhere and can be changed from the top bar or Profile. |
| 🔍 **Smart search** | Matches English, Hindi (with or without the nukta) and Hinglish words like *pyaz*, *aloo* and *tamatar*. Tolerates small typos, ranks the best matches first, and filters by category. |
| 🎙️ **Voice search** | Tap the mic and speak in Hindi (`hi-IN`) or Indian English (`en-IN`). Works in Chrome, Edge and Android browsers. |
| ⚖️ **Fair-price check** | Compares each price with the median of nearby vendor groups and flags anything more than 15% above it. |
| 🧺 **Live cart** | Saved in Firestore and synced across devices. Every change runs in a transaction, so quick taps never overwrite each other. |
| 🚚 **Delivery options** | Express (45 min, ₹30), Scheduled (tomorrow 6–7 AM, ₹10) or Saver (24 h, free), plus OTP-verified delivery (₹5). |
| 💳 **Payment** | UPI (QR code and UPI ID) or cash on delivery. |
| 📦 **Orders** | Order history with a progress tracker and expected delivery time. You can cancel before the order is out for delivery, and coins are refunded. |
| 💰 **Apna Coins** | Earn 1 coin per ₹20 spent. Redeem 50 coins for a free delivery, which is applied automatically at checkout. |
| 🗺️ **Vendor groups** | Leaflet map plus an accessible list of 15 groups around Delhi NCR, with stock, prices, reviews and join requests. |
| 🔁 **Community barter** | A live board where vendors post swap offers. |
| 🥬 **Mandi theme** | Leaf green, tomato red and turmeric yellow on a warm cream background, with a cardless landing page: open sections, hairlines, big type. |
| 🔎 **SEO** | Landing page pre-rendered to HTML at build time, with keyword-focused title and description, JSON-LD (Organization, WebSite, WebApplication, FAQPage), Open Graph share image, `robots.txt` and `sitemap.xml`. Login and dashboard are `noindex`. |
| ✨ **Motion design** | Word-by-word hero reveal, scroll-linked parallax, tilt cards, sliding tab indicators, cards that reflow when you filter, animated counters and a success tick with confetti. All of it respects the reduce-motion setting. |
| 🖼️ **No pictures** | No image files or Lottie animations: visuals come from CSS gradients, code-drawn SVG and vector icons, so pages stay light. The UPI QR is generated with the real amount. |
| ♿ **Accessible** | Real buttons and links, labelled form fields, keyboard-friendly dialogs, screen-reader announcements, and support for reduced motion. |

## Tech stack

React 19 · Vite 6 · React Router 7 · Firebase Auth + Cloud Firestore (offline cache) · Framer Motion · React Icons · Leaflet / React-Leaflet · qrcode.react · Vitest + Testing Library · ESLint · Vercel

## Project structure

```text
Bazar-Buddy/
├── firebase/
│   ├── firestore.rules           # security rules
│   └── firestore.indexes.json    # composite index for the orders query
├── public/                       # manifest, app icons
├── src/
│   ├── main.jsx                  # browser entry (hydrates the pre-rendered landing page)
│   ├── entry-server.jsx          # build-time renderer for the landing page
│   ├── App.jsx                   # landing page + lazy app shell
│   ├── routes/
│   │   ├── AppShell.jsx          # Firebase, auth, toasts, login + dashboard routes
│   │   ├── lazy.js               # chunk loaders + idle prefetching
│   │   └── sessionCheck.js       # lets the landing page detect a signed-in vendor
│   ├── components/
│   │   ├── common/               # BrandMark, ProductIcon, LanguageToggle, Modal, Loader, Toast styles
│   │   ├── layout/               # TopNavbar, BottomNav, RouteGuards
│   │   └── motion/               # Reveal, Stagger, WordReveal, TiltCard, Aurora, Confetti…
│   ├── config/                   # firebase.js, app.js (fees, coin rules)
│   ├── context/                  # Language, Auth, Toast, Shop (cart + orders)
│   ├── data/                     # product catalog, vendor groups
│   ├── features/                 # one folder per dashboard tab
│   │   ├── home/
│   │   ├── market/               # search, product cards, cart + checkout
│   │   ├── orders/               # order list + tracker (used by Home and Market)
│   │   ├── wallet/
│   │   ├── trade/                # map, group details, barter board
│   │   ├── profile/
│   │   └── help/
│   ├── hooks/                    # useVoiceSearch, useNow
│   ├── i18n/                     # translations (en + hi), language list
│   ├── seo/                      # JSON-LD builder + SEO tests
│   ├── pages/
│   │   ├── landing/              # LandingPage, PhoneMock
│   │   ├── auth/                 # AuthPage
│   │   └── dashboard/            # DashboardPage (tab transitions)
│   ├── services/                 # Firestore only: cart, orders, users, vendors
│   ├── styles/                   # global.css (design tokens, shared classes)
│   └── utils/                    # search, pricing, order status, validation, format
├── scripts/prerender.js          # writes landing HTML, JSON-LD and sitemap.xml into dist/
├── index.html                    # Vite HTML entry with SEO meta tags
├── vite.config.js                # build, vendor chunks, Vitest
├── eslint.config.js
├── vercel.json                   # SPA rewrites + cache headers
├── firebase.json
├── .env.example                  # copy to .env.local
└── package.json
```

Tests sit next to the code they cover (`*.test.js` / `*.test.jsx`). `src/pages/dashboard/DashboardPage.test.jsx` renders every tab with Firebase mocked.

### Routes

| Path | Screen |
|---|---|
| `/` | Landing page (signed-in vendors are sent to the dashboard) |
| `/auth` | Login / register / password reset (`?mode=register` opens sign-up) |
| `/dashboard` | Home (login required) |
| `/dashboard/market` | Search, products, cart, my orders |
| `/dashboard/wallet` | Coins, savings, redemptions, transactions |
| `/dashboard/trade` | Vendor map, groups, barter board |
| `/dashboard/profile` | Profile, language, logout |
| `/dashboard/help` | Support numbers and FAQs |

### Firestore data model

| Collection | Contents | Who can access |
|---|---|---|
| `users/{uid}` | name, phone, language, coins, freeDeliveryCredits, savings | Owner only |
| `users/{uid}/redemptions` | coin redemption history | Owner only |
| `carts/{uid}` | `items: [{id, quantity}]`, speed, verified, payment | Owner only |
| `orders/{id}` | items, fees, total, OTP, status, coinsEarned | Owner; can only cancel |
| `vendorGroups/{id}/reviews` | rating (1–5) and text | Any signed-in user can read and add |
| `vendorGroups/{id}/joinRequests/{uid}` | one request per vendor | Owner |
| `barters/{id}` | offer and request | Any signed-in user can read; the author can delete |

Prices are always read from the catalog in `src/data/products.js`, never from the cart document.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase web config
npm run dev
```

Or pull the config straight from Vercel: `npx vercel env pull .env.development.local --environment production`.

In the Firebase console, enable **Authentication → Email/Password** and create a **Firestore** database. Then deploy the rules and index:

```bash
npx firebase-tools deploy --only firestore --project <your-project-id>
```

If the Firebase variables are missing, the app shows a setup screen instead of crashing.

Optional variables: `REACT_APP_UPI_ID`, `REACT_APP_SUPPORT_PHONE`, `REACT_APP_TOLL_FREE`.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` (or `npm start`) | Vite dev server on http://localhost:3000, with instant reload |
| `npm test` | Vitest in watch mode |
| `npm run test:ci` | Run all tests once |
| `npm run lint` | ESLint |
| `npm run build` | Production build in `dist/`, then pre-renders the landing page and writes `sitemap.xml` |
| `npm run preview` | Serve the production build locally |

## Performance

| | Before (Create React App) | Now (Vite) |
|---|---|---|
| Dev server cold start | 65 s | ~0.5 s (ready), ~3 s including Node startup |
| Dev page load | 13.7 MB bundle | ~0.2 s, modules served on demand |
| Production build | 49 s | ~5–8 s |
| JS needed for the landing page (gzip) | 285 kB + chunks, Firebase included | ~164 kB, no Firebase |

How:
- **Firebase stays off the landing page.** Firebase, login and the dashboard live in a lazy app-shell chunk. They are prefetched while the browser is idle (skipped on Data Saver / 2G) and when a finger or cursor heads for a call-to-action button.
- **Libraries split into long-lived vendor chunks** (`react`, `motion`, `firebase`, `map`), so a deploy doesn't force visitors to re-download libraries. Vercel serves `/assets/*` with a one-year immutable cache.
- **Every tab is its own chunk.** The other tabs are prefetched once the dashboard is open, so switching is instant.
- **Firestore offline cache** (IndexedDB) shows the cart, orders and profile instantly on repeat visits. Auth is initialised without the unused popup/redirect code.
- **No images or Lottie files**, one font family, and an inline background color so the first paint isn't a white flash.

## Deployment (Vercel)

The Vercel project is connected to this GitHub repo: every push to `main` deploys to production at https://bazar-buddy-neon.vercel.app, and other branches get preview links. The app lives at the repo root, so the Root Directory setting stays empty. The `REACT_APP_FIREBASE_*` variables are set in Project Settings → Environment Variables. `vercel.json` sets the Vite framework preset (output `dist/`), rewrites every route to `index.html` so deep links work, and adds long-term cache headers for hashed assets.

## Getting found on Google

The site already sends the right signals (pre-rendered content, structured data, sitemap, fast loading). To get indexed and rank:

1. Add the site to [Google Search Console](https://search.google.com/search-console) and submit `https://bazar-buddy-neon.vercel.app/sitemap.xml`. Do the same in Bing Webmaster Tools.
2. Use a custom domain (e.g. `bazarbuddy.in`). Set `REACT_APP_SITE_URL` on Vercel and update the URLs in `index.html` and `public/robots.txt`.
3. Create a Google Business Profile, and get links from vendor associations, local news and directories.

Searches for "Bazar Buddy" should show the site first once it is indexed. Generic terms such as "wholesale vegetables Delhi" take time and links; no code can guarantee a #1 ranking.

## Known limitations / roadmap

- **Order progress is estimated** from the order time and delivery speed. Connect a supplier or delivery-partner API to report real status.
- **UPI payments are not verified automatically.** The supplier confirms them on delivery. Add a payment gateway (e.g. Razorpay) with server-side verification before handling real money.
- **Coin balances are updated by the client** and only limited by the security rules. Move coin and order logic to Cloud Functions for production.
- The catalog and vendor groups are static files. Next step: a supplier dashboard backed by Firestore.

## License

MIT
