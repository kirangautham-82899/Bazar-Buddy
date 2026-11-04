// @vitest-environment node
// Guards what search engines see: the pre-rendered landing HTML and the JSON-LD.
import { readFileSync } from 'node:fs';
import { render } from '../entry-server';
import { buildStructuredData } from './structuredData';
import { LANDING_FAQ } from '../pages/landing/content';
import { t } from '../content/strings';

describe('pre-rendered landing page', () => {
  const html = render('/');

  it('contains the H1 and main sections as real text', () => {
    expect(html).toMatch(/<h1[^>]*aria-label="Fresh vegetables &amp; groceries at fair wholesale prices"/);
    expect(html).toContain(t('heroSubtitle'));
    expect(html).toContain(t('categoriesTitle'));
    expect(html).toContain(t('howTitle'));
    expect(html).toContain(t('catVegetables'));
  });

  it('speaks to all of India, not one city', () => {
    expect(html).toContain('across India');
    expect(html).not.toMatch(/Delhi|NCR/);
  });

  it('includes every FAQ answer in the HTML', () => {
    LANDING_FAQ.forEach((n) => expect(html).toContain(t(`faq${n}a`)));
  });

  it('has no Hindi text', () => {
    expect(html).not.toMatch(/[ऀ-ॿ]/);
  });

  it('has exactly one h1', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });
});

describe('structured data', () => {
  const data = buildStructuredData();
  const types = data['@graph'].map((node) => node['@type']);

  it('describes the organisation, website, app and FAQ', () => {
    expect(types).toEqual(['Organization', 'WebSite', 'WebApplication', 'FAQPage']);
  });

  it('serves the whole country', () => {
    const app = data['@graph'].find((node) => node['@type'] === 'WebApplication');
    expect(app.areaServed).toEqual({ '@type': 'Country', name: 'India' });
  });

  it('mirrors the visible FAQ exactly', () => {
    const faq = data['@graph'].find((node) => node['@type'] === 'FAQPage');
    expect(faq.mainEntity.map((q) => q.name)).toEqual(LANDING_FAQ.map((n) => t(`faq${n}q`)));
    faq.mainEntity.forEach((q) => expect(q.acceptedAnswer.text.length).toBeGreaterThan(20));
  });
});

describe('index.html', () => {
  const html = readFileSync('index.html', 'utf8');

  it('has the SEO tags and pre-render markers', () => {
    expect(html).toMatch(/<title>[^<]{30,70}<\/title>/);
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{120,170}"/);
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('<!--app-html-->');
    expect(html).toContain('<!--structured-data-->');
    expect(html).not.toMatch(/Delhi|NCR/);
  });
});
