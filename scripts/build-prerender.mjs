/**
 * Writes one HTML file per route into dist/, so every page arrives with its
 * own title, description, canonical, social card and structured data.
 *
 *   npm run build     runs this after `vite build`
 *
 * Why it exists. The site is one React bundle behind a catch-all rewrite, so
 * every one of the 228 addresses was served the same index.html: the same
 * title, the same description, and an og:url naming the home page. React
 * corrects all of that, but only after it runs. Google renders JavaScript
 * eventually; the scrapers behind WhatsApp, Instagram, Facebook and LinkedIn
 * never do, so every link anyone shared showed the home page's card.
 *
 * Vercel serves a real file in preference to a rewrite, so dist/products/x/
 * index.html answers /products/x and the catch-all never sees it. React still
 * boots and takes over as before; this only changes what arrives before it.
 *
 * The <noscript> block is rewritten per page too. It is invisible to anyone
 * with JavaScript, and it is what a crawler reads on its first pass, so it
 * carries the page's own words rather than the site's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS, PROJECTS, DEFAULT_DIMENSION } from '../src/data.js';
import {
  SITE_URL,
  STATIC_META,
  STATIC_META_PATHS,
  clampDescription,
  productTitle,
  projectTitle,
  shortProductName,
  sitemapPaths,
} from '../src/siteMeta.js';

const DIST = 'dist';
const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

/** The five characters that must not appear raw in markup or an attribute. */
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Inside a JSON-LD <script> only the closing-tag sequence needs breaking up. */
const jsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

/** `/assets/image/OSLO X.webp` -> the absolute, encoded 800px copy. */
const socialImage = (image) => {
  const [file] = String(image).split('?');
  const cut = file.lastIndexOf('/');
  return SITE_URL + encodeURI(`${file.slice(0, cut)}/w800${file.slice(cut)}`);
};

/** Replaces the content of one <meta> by its name or property attribute. */
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  if (!re.test(html)) return html;
  return html.replace(re, `$1${esc(value)}$2`);
};

function render(route, page) {
  let html = shell;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:url', SITE_URL + route);
  html = setMeta(html, 'property', 'og:type', page.ogType || 'website');
  if (page.image) html = setMeta(html, 'property', 'og:image', page.image);
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${esc(SITE_URL + route)}">`
  );

  if (page.schema?.length) {
    const scripts = page.schema
      .map((data) => `<script type="application/ld+json" class="page-ld">\n${jsonLd(data)}\n</script>`)
      .join('\n');
    html = html.replace('</head>', `${scripts}\n</head>`);
  }

  // The trail carries the id useDocumentMeta looks for, so React replaces
  // this one when the visitor navigates instead of leaving two on the page.
  if (page.breadcrumbs) {
    html = html.replace(
      '</head>',
      `<script type="application/ld+json" id="breadcrumbs-ld">\n${jsonLd(page.breadcrumbs)}\n</script>\n</head>`
    );
  }

  if (page.noscript) {
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>\n${page.noscript}\n</noscript>`);
  }

  return html;
}

/** Home → this page, as both a visible trail and BreadcrumbList data. */
const crumbs = (trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, url], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: SITE_URL + url,
  })),
});

const pages = new Map();

// ---- the pages that exist regardless of the catalogue ----
for (const [route, key] of Object.entries(STATIC_META_PATHS)) {
  const { title, description } = STATIC_META.en[key];
  pages.set(route, { title, description });
}

// ---- one veneer ----
for (const product of PRODUCTS) {
  const route = `/products/${product.id}`;
  const name = shortProductName(product);
  const description = clampDescription(product.longDesc);
  const image = socialImage(product.image);
  const dimension = product.dimension || DEFAULT_DIMENSION;

  pages.set(route, {
    title: productTitle(product),
    description,
    image,
    ogType: 'product',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description,
        image,
        url: SITE_URL + route,
        sku: product.id,
        category: `${product.collectionLabel} veneer`,
        material: product.species || undefined,
        brand: { '@type': 'Brand', name: 'KAIU' },
        manufacturer: { '@id': `${SITE_URL}/#organization` },
        // Prices are quoted per project, so the offer states availability
        // and who sells it without inventing a number.
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'IDR',
          url: SITE_URL + route,
          seller: { '@id': `${SITE_URL}/#organization` },
        },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Collection', value: product.collectionLabel },
          { '@type': 'PropertyValue', name: 'Cut', value: product.cut },
          { '@type': 'PropertyValue', name: 'Sheet size', value: dimension },
          { '@type': 'PropertyValue', name: 'Finish', value: product.finish },
        ].filter((p) => p.value),
      },
    ],
    breadcrumbs: crumbs([
      ['Home', '/'],
      ['Products', '/products'],
      [product.collectionLabel, '/products'],
      [name, route],
    ]),
    noscript: [
      `  <h1>${esc(product.name)} veneer</h1>`,
      `  <p>${esc(product.longDesc)}</p>`,
      `  <p>Collection: ${esc(product.collectionLabel)}. Cut: ${esc(product.cut)}.`,
      `     Species: ${esc(product.species)}. Sheet size: ${esc(dimension)}.</p>`,
      `  <p><a href="/products">All KAIU veneers</a> · <a href="/contact">Request a sample</a></p>`,
    ].join('\n'),
  });
}

// ---- one project ----
for (const project of PROJECTS) {
  const route = `/projects/${project.id}`;
  const description = clampDescription(project.longDesc);
  const image = socialImage(project.images[0].src);
  const veneers = (project.veneers || [])
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  pages.set(route, {
    title: projectTitle(project),
    description,
    image,
    ogType: 'article',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description,
        image,
        url: SITE_URL + route,
        locationCreated: { '@type': 'Place', name: project.location },
        about: project.room,
        creator: project.designer ? { '@type': 'Organization', name: project.designer } : undefined,
        provider: { '@id': `${SITE_URL}/#organization` },
        material: veneers.map((p) => p.name),
      },
    ],
    breadcrumbs: crumbs([
      ['Home', '/'],
      ['Projects', '/projects'],
      [project.title, route],
    ]),
    noscript: [
      `  <h1>${esc(project.title)}</h1>`,
      `  <p>${esc(project.room)} in ${esc(project.location)}${project.designer ? `, by ${esc(project.designer)}` : ''}.</p>`,
      `  <p>${esc(project.longDesc)}</p>`,
      veneers.length
        ? `  <p>Finished in ${veneers
            .map((p) => `<a href="/products/${esc(p.id)}">${esc(p.name)}</a>`)
            .join(', ')}.</p>`
        : '',
      `  <p><a href="/projects">All KAIU projects</a></p>`,
    ]
      .filter(Boolean)
      .join('\n'),
  });
}

// ---- write one file per route ----
let written = 0;
for (const route of sitemapPaths(PRODUCTS, PROJECTS)) {
  const page = pages.get(route);
  if (!page) continue;
  const html = render(route, page);
  // "/" is dist/index.html itself; the rest get a folder with an index.
  const file = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written += 1;
}

console.log(
  `\nprerender: ${written} pages, each with its own title, description, canonical, social card and structured data\n`
);
