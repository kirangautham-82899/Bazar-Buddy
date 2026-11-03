// Everything the landing page shows, in one place. Text lives in content/strings.js;
// this file decides which pieces appear and in what order.
import { FaBoxOpen, FaMoneyBillWave, FaSearch, FaShippingFast, FaSyncAlt, FaTags } from 'react-icons/fa';

export const NAV_LINKS = [
  { href: '#features', label: 'navFeatures' },
  { href: '#how', label: 'navHow' },
  { href: '#faq', label: 'navFaq' },
];

export const HERO_TRUST = ['heroTrust1', 'heroTrust2', 'heroTrust3'];

// Three pieces of produce float around the phone in the hero.
export const HERO_PRODUCE = ['tomato', 'green-chilli', 'lemon'];

export const FEATURES = [
  { icon: FaSearch, title: 'feat1Title', body: 'feat1Body', tone: 'green' },
  { icon: FaSyncAlt, title: 'feat2Title', body: 'feat2Body', tone: 'tomato' },
  { icon: FaShippingFast, title: 'feat3Title', body: 'feat3Body', tone: 'turmeric' },
  { icon: FaTags, title: 'feat4Title', body: 'feat4Body', tone: 'green' },
  { icon: FaMoneyBillWave, title: 'feat5Title', body: 'feat5Body', tone: 'turmeric' },
  { icon: FaBoxOpen, title: 'feat6Title', body: 'feat6Body', tone: 'tomato' },
];

// Categories shown on the landing page (the shop shows all of them).
export const CATEGORY_SHOWCASE = ['vegetables', 'fruits', 'grains', 'spices', 'dairy', 'oil'];

export const STEPS = ['step1', 'step2', 'step3'];

// FAQ shown on the page and mirrored in the FAQPage structured data.
export const LANDING_FAQ = [1, 3, 4, 5, 2];

export const FOOTER_COLUMNS = [
  { title: 'footerProduct', links: NAV_LINKS },
  {
    title: 'footerAccount',
    links: [
      { to: '/shop', label: 'startShopping' },
      { to: '/auth', label: 'login' },
    ],
  },
];
