/**
 * Writes public/sitemap.xml and public/robots.txt from the catalogue.
 *
 *   npm run sitemap     write them now
 *
 * It also runs as the first half of `npm run build`, so a deploy can never
 * ship a sitemap that disagrees with src/data.js.
 *
 * The site needs one more than most. The collections page shows four veneers
 * and reveals the rest behind a "Show more" button, and a crawler does not
 * press buttons — so of 216 veneers, four are reachable by following links and
 * the other 212 are not linked from anywhere. The sitemap is what tells a
 * search engine they exist.
 *
 * Both files are generated but committed, so that `npm run dev` serves them
 * and a change to either is visible in review.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS, PROJECTS } from '../src/data.js';
import { SITE_URL, sitemapPaths } from '../src/siteMeta.js';

const OUT = 'public';

// Only the five characters XML reserves; the ids are plain kebab-case, but a
// sitemap that silently breaks on one odd id is worse than one that escapes.
const xml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

const paths = sitemapPaths(PRODUCTS, PROJECTS);

// No lastmod: a build timestamp would say every page changed on every deploy,
// and a date that is not true is worse than no date at all. No changefreq or
// priority either — Google ignores both.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${xml(SITE_URL + p)}</loc></url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(OUT, 'robots.txt'), robots);

console.log(
  `\nsitemap.xml: ${paths.length} urls (${PRODUCTS.length} veneers, ${PROJECTS.length} projects) at ${SITE_URL}`
);
console.log('robots.txt: allows everything, points at the sitemap\n');
