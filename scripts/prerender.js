// Runs after `vite build` and `vite build --ssr`: writes the landing page's
// HTML and JSON-LD into dist/index.html, generates sitemap.xml, then removes
// the temporary server bundle.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');
const siteUrl = (process.env.REACT_APP_SITE_URL || 'https://bazar-buddy-neon.vercel.app').replace(/\/$/, '');

const { render, buildStructuredData } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

const indexPath = path.join(dist, 'index.html');
const template = readFileSync(indexPath, 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('dist/index.html is missing the <!--app-html--> marker');

// "<" is escaped so the JSON can never close the script tag early.
const jsonLd = JSON.stringify(buildStructuredData('en')).replace(/</g, '\\u003c');
const html = template
  .replace('<!--app-html-->', render('/'))
  .replace('<!--structured-data-->', `<script type="application/ld+json">${jsonLd}</script>`);
writeFileSync(indexPath, html);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
);

rmSync(ssrDir, { recursive: true, force: true });
console.log(`Pre-rendered / (${Math.round(html.length / 1024)} kB HTML) and wrote sitemap.xml`);
