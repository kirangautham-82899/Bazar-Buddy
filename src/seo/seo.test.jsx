// @vitest-environment node
// Guards what search engines see: the pre-rendered landing HTML and the JSON-LD.
import { readFileSync } from 'node:fs';
import { render } from '../entry-server';
import { FAQ_NUMBERS, buildStructuredData } from './structuredData';
import { translate } from '../i18n/translations';

const t = (key) => translate('en', key);

describe('pre-rendered landing page', () => {
  const html = render('/');

  it('contains the H1 and main sections as real text', () => {
    expect(html).toMatch(/<h1[^>]*aria-label="Fresh vegetables &amp; groceries at fair mandi prices"/);
    expect(html).toContain(t('heroSubtitle'));
    expect(html).toContain(t('categoriesTitle'));
    expect(html).toContain(t('areasTitle'));
    expect(html).toContain('Chandni Chowk');
  });

  it('includes every FAQ answer in the HTML', () => {
    FAQ_NUMBERS.forEach((n) => expect(html).toContain(t(`faq${n}a`)));
  });

  it('names products in both English and Hindi', () => {
    expect(html).toContain('Tomatoes');
    expect(html).toContain('टमाटर');
  });

  it('has exactly one h1', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });
});

describe('structured data', () => {
  const data = buildStructuredData('en');
  const types = data['@graph'].map((node) => node['@type']);

  it('describes the organisation, website, app and FAQ', () => {
    expect(types).toEqual(['Organization', 'WebSite', 'WebApplication', 'FAQPage']);
  });

  it('mirrors the visible FAQ exactly', () => {
    const faq = data['@graph'].find((node) => node['@type'] === 'FAQPage');
    expect(faq.mainEntity.map((q) => q.name)).toEqual(FAQ_NUMBERS.map((n) => t(`faq${n}q`)));
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
  });
});
