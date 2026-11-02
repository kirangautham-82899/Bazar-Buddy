// JSON-LD for search engines, built from the same translations the page shows,
// so the FAQ rich result can never drift from the visible FAQ.
import { translate } from '../i18n/translations';
import { SITE_URL } from '../config/app';
import { LANDING_FAQ } from '../pages/landing/content';

const INDIA = { '@type': 'Country', name: 'India' };

export const buildStructuredData = (lang = 'en') => {
  const t = (key) => translate(lang, key);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Bazar Buddy',
        alternateName: 'बाज़ार बडी',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo512.png`,
        description: t('footerTagline'),
        areaServed: INDIA,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Bazar Buddy',
        url: `${SITE_URL}/`,
        inLanguage: ['en-IN', 'hi-IN'],
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'WebApplication',
        name: 'Bazar Buddy',
        url: `${SITE_URL}/`,
        applicationCategory: 'ShoppingApplication',
        operatingSystem: 'Web, Android, iOS',
        inLanguage: ['en-IN', 'hi-IN'],
        description: t('heroSubtitle'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        areaServed: INDIA,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: LANDING_FAQ.map((n) => ({
          '@type': 'Question',
          name: t(`faq${n}q`),
          acceptedAnswer: { '@type': 'Answer', text: t(`faq${n}a`) },
        })),
      },
    ],
  };
};
