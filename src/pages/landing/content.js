// Everything the landing page shows, in one place. Text lives in content/strings.js;
// this file decides which pieces appear and in what order.
import { FaBoxOpen, FaMoneyBillWave, FaSearch, FaShippingFast, FaSyncAlt, FaTags } from 'react-icons/fa';

export const NAV_LINKS = [
  { href: '#features', label: 'navFeatures' },
  { href: '#how', label: 'navHow' },
  { href: '#faq', label: 'navFaq' },
];

export const HERO_TRUST = ['heroTrust1', 'heroTrust2', 'heroTrust3'];


export const FEATURES = [
  { icon: FaSearch, title: 'feat1Title', body: 'feat1Body' },
  { icon: FaSyncAlt, title: 'feat2Title', body: 'feat2Body' },
  { icon: FaShippingFast, title: 'feat3Title', body: 'feat3Body' },
  { icon: FaTags, title: 'feat4Title', body: 'feat4Body' },
  { icon: FaMoneyBillWave, title: 'feat5Title', body: 'feat5Body' },
  { icon: FaBoxOpen, title: 'feat6Title', body: 'feat6Body' },
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
