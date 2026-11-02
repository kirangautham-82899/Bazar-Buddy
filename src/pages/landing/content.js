// Everything the landing page shows, in one place. Text lives in i18n/translations.js;
// this file decides which pieces appear and in what order.
import {
  FaBalanceScale,
  FaCoins,
  FaLanguage,
  FaShieldAlt,
  FaShippingFast,
  FaUsers,
} from 'react-icons/fa';

export const NAV_LINKS = [
  { href: '#features', label: 'navFeatures' },
  { href: '#how', label: 'navHow' },
  { href: '#faq', label: 'navFaq' },
];

export const HERO_TRUST = ['heroTrust1', 'heroTrust2', 'heroTrust3'];

// Three pieces of produce float around the phone in the hero.
export const HERO_PRODUCE = ['tomato', 'green-chilli', 'lemon'];

export const FEATURES = [
  { icon: FaLanguage, title: 'feat1Title', body: 'feat1Body', tone: 'green' },
  { icon: FaBalanceScale, title: 'feat2Title', body: 'feat2Body', tone: 'tomato' },
  { icon: FaShippingFast, title: 'feat3Title', body: 'feat3Body', tone: 'turmeric' },
  { icon: FaShieldAlt, title: 'feat4Title', body: 'feat4Body', tone: 'green' },
  { icon: FaCoins, title: 'feat5Title', body: 'feat5Body', tone: 'turmeric' },
  { icon: FaUsers, title: 'feat6Title', body: 'feat6Body', tone: 'tomato' },
];

// One representative product icon per category (categories, not the sample catalog).
export const CATEGORY_SHOWCASE = [
  { category: 'vegetables', icon: 'tomato' },
  { category: 'fruits', icon: 'banana' },
  { category: 'grains', icon: 'atta' },
  { category: 'spices', icon: 'red-chilli-powder' },
  { category: 'dairy', icon: 'milk' },
  { category: 'oil', icon: 'mustard-oil' },
];

export const STEPS = ['step1', 'step2', 'step3'];

// FAQ shown on the page and mirrored in the FAQPage structured data.
export const LANDING_FAQ = [1, 6, 4, 5, 2];

export const FOOTER_COLUMNS = [
  { title: 'footerProduct', links: NAV_LINKS.map(({ href, label }) => ({ href, label })) },
  {
    title: 'footerAccount',
    links: [
      { to: '/auth?mode=register', label: 'register' },
      { to: '/auth', label: 'login' },
    ],
  },
];
