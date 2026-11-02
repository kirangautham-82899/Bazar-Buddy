// JSON-LD for search engines, built from the same strings the page shows,
// so the FAQ rich result can never drift from the visible FAQ.
import { t } from '../content/strings';
import { SITE_URL } from '../config/app';
import { LANDING_FAQ } from '../pages/landing/content';

const INDIA = { '@type': 'Country', name: 'India' };

export const buildStructuredData = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Bazar Buddy',
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
      inLanguage: 'en-IN',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebApplication',
      name: 'Bazar Buddy',
      url: `${SITE_URL}/`,
      applicationCategory: 'ShoppingApplication',
      operatingSystem: 'Web, Android, iOS',
      inLanguage: 'en-IN',
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
});
