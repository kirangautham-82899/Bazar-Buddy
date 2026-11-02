<div align="center">

# 🛒 Bazar Buddy

### Fresh raw material at fair prices for every street vendor

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
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
| ♿ **Accessible** | Real buttons and links, labelled form fields, keyboard-friendly dialogs, screen-reader announcements, and support for reduced motion. |

## Tech stack

React 19 (Create React App) · React Router 7 · Firebase Auth + Cloud Firestore · Framer Motion · Lottie · Leaflet / React-Leaflet · Jest + Testing Library · Vercel

## Project structure

```text
Bazar-Buddy/
├── README.md
└── bazar-buddy/                  # the React app (Vercel root directory)
    ├── public/                   # index.html, manifest, icons
    ├── firestore.rules           # security rules (deploy with the Firebase CLI)
    ├── firestore.indexes.json    # composite index for the orders query
    ├── firebase.json
    ├── .env.example              # copy to .env.local
    └── src/
        ├── App.jsx               # providers + routes (sections are lazy-loaded)
        ├── index.js
        ├── assets/
        │   ├── animations/       # Lottie JSON
        │   └── images/
        ├── components/
        │   ├── common/           # Modal, Loader, SetupScreen
        │   └── layout/           # TopNavbar, BottomNav, RouteGuards
        ├── config/               # firebase.js, app.js (fees, coin rules)
        ├── context/              # Language, Auth, Toast, Shop (cart + orders)
        ├── data/                 # product catalog, vendor groups
        ├── features/
        │   ├── home/
        │   ├── market/           # search, products, cart, orders
        │   ├── wallet/
        │   ├── trade/            # map, group details, barter board
        │   ├── profile/
        │   └── help/
        ├── hooks/                # useVoiceSearch, useNow
        ├── i18n/                 # translations (en + hi)
        ├── pages/                # LanguagePage, AuthPage, DashboardPage
        ├── services/             # Firestore access: cart, orders, users, vendors
        ├── styles/               # global.css (design tokens)
        └── utils/                # search, pricing, order status, validation, format
```

### Routes

| Path | Screen |
|---|---|
| `/` | Language picker (skipped once a language is chosen) |
| `/auth` | Login / register / password reset |
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
cd bazar-buddy
npm install
cp .env.example .env.local   # then fill in your Firebase web config
npm start
```

In the Firebase console, enable **Authentication → Email/Password** and create a **Firestore** database. Then deploy the rules and index:

```bash
npx firebase-tools deploy --only firestore --project <your-project-id>
```

If the Firebase variables are missing, the app shows a setup screen instead of crashing.

Optional variables: `REACT_APP_UPI_ID`, `REACT_APP_SUPPORT_PHONE`, `REACT_APP_TOLL_FREE`.

### Scripts

| Command | Purpose |
|---|---|
| `npm start` | Dev server on http://localhost:3000 |
| `npm test` | Tests in watch mode |
| `npm run test:ci` | Run all tests once |
| `npm run build` | Production build in `build/` |

## Deployment (Vercel)

Set the Vercel project's **Root Directory** to `bazar-buddy` and add the `REACT_APP_FIREBASE_*` variables in Project Settings → Environment Variables. `vercel.json` already rewrites every route to `index.html` so deep links work.

## Known limitations / roadmap

- **Order progress is estimated** from the order time and delivery speed. Connect a supplier or delivery-partner API to report real status.
- **UPI payments are not verified automatically.** The supplier confirms them on delivery. Add a payment gateway (e.g. Razorpay) with server-side verification before handling real money.
- **Coin balances are updated by the client** and only limited by the security rules. Move coin and order logic to Cloud Functions for production.
- The catalog and vendor groups are static files. Next step: a supplier dashboard backed by Firestore.

## License

MIT
