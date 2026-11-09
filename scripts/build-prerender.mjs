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
import { PRODUCTS, PROJECTS, SERVICES, DEFAULT_DIMENSION } from '../src/data.js';
import {
  SITE_URL,
  STATIC_META,
  STATIC_META_PATHS,
  clampDescription,
  pathInLang,
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

const OG_LOCALE = { en: 'en_US', id: 'id_ID' };

function render(route, page, lang = 'en') {
  let html = shell;
  const url = SITE_URL + pathInLang(route, lang);

  html = html.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:type', page.ogType || 'website');
  html = setMeta(html, 'property', 'og:locale', OG_LOCALE[lang]);
  html = setMeta(html, 'property', 'og:locale:alternate', OG_LOCALE[lang === 'en' ? 'id' : 'en']);
  if (page.image) html = setMeta(html, 'property', 'og:image', page.image);
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${esc(url)}">\n` +
      `<link rel="alternate" hreflang="en" href="${esc(SITE_URL + route)}">\n` +
      `<link rel="alternate" hreflang="id" href="${esc(SITE_URL + pathInLang(route, 'id'))}">\n` +
      `<link rel="alternate" hreflang="x-default" href="${esc(SITE_URL + route)}">`
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

/** The words a page is built from, in each language. */
const WORDS = {
  en: {
    home: 'Home', products: 'Products', projects: 'Projects',
    collection: 'Collection', species: 'Species', sheetSize: 'Sheet size', finish: 'Finish',
    veneerName: (name) => `${name} veneer`,
    collectionCategory: (label) => `${label} veneer`,
    allVeneers: 'All KAIU veneers', requestSample: 'Request a sample',
    allProjects: 'All KAIU projects',
    roomIn: (room, location, designer) => `${room} in ${location}${designer ? `, by ${designer}` : ''}.`,
    finishedIn: 'Finished in',
    productsHeading: 'Wood veneer collections',
    productsIntro: (n, names) => `${n} KAIU veneers across six collections: ${names}.`,
    standardSheet: 'Standard sheet size',
    projectsHeading: 'Projects finished in KAIU veneer',
    servicesHeading: 'Services',
    browse: 'Browse the veneer collections', talk: 'Talk to the KAIU team',
    inRoom: 'in',
  },
  id: {
    home: 'Beranda', products: 'Produk', projects: 'Proyek',
    collection: 'Koleksi', species: 'Spesies', sheetSize: 'Ukuran lembar', finish: 'Finishing',
    veneerName: (name) => `Veneer ${name}`,
    collectionCategory: (label) => `Veneer ${label}`,
    allVeneers: 'Semua veneer KAIU', requestSample: 'Minta sampel',
    allProjects: 'Semua proyek KAIU',
    roomIn: (room, location, designer) => `${room} di ${location}${designer ? `, oleh ${designer}` : ''}.`,
    finishedIn: 'Menggunakan',
    productsHeading: 'Koleksi veneer kayu',
    productsIntro: (n, names) => `${n} veneer KAIU dalam enam koleksi: ${names}.`,
    standardSheet: 'Ukuran lembar standar',
    projectsHeading: 'Proyek dengan veneer KAIU',
    servicesHeading: 'Layanan',
    browse: 'Jelajahi koleksi veneer', talk: 'Hubungi tim KAIU',
    inRoom: 'di',
  },
};

/** The Indonesian field where there is one, in either language. */
const pick = (item, field, lang) => {
  const idField = `id${field[0].toUpperCase()}${field.slice(1)}`;
  return (lang === 'id' && item[idField]) || item[field];
};

/**
 * The block the home, about and contact pages carry. The English one is
 * already in index.html; Indonesian pages need their own.
 */
const NOSCRIPT_ID = [
  '  <h1>KAIU - Veneer Kayu</h1>',
  '  <p>KAIU merancang dan memasok veneer kayu premium untuk arsitek, desainer, produsen, dan pemilik rumah.',
  '     Enam koleksi, dari oak Skandinavia yang pucat hingga walnut gelap berasap.</p>',
  '  <p>Studio: Jalan Pluit Karang Sari Blok B7T, 64 RT 001 / RW 12, Jakarta Utara 14450, Indonesia.',
  '     Email <a href="mailto:kaiuveneer@gmail.com">kaiuveneer@gmail.com</a>,',
  '     telepon <a href="tel:+628131205377">+62 813 1205 377</a>.</p>',
  '  <ul>',
  '    <li><a href="/id/products">Koleksi veneer: Athens, Berlin, Cairo, Cannes, Oslo, dan Zurich</a></li>',
  '    <li><a href="/id/projects">Proyek dengan veneer KAIU</a></li>',
  '    <li><a href="/id/services">Layanan: veneer, fabrikasi panel, dan finishing</a></li>',
  '    <li><a href="/id/about">Tentang KAIU</a></li>',
  '    <li><a href="/id/contact">Hubungi KAIU</a></li>',
  '  </ul>',
].join('\n');

function buildPages(lang) {
  const w = WORDS[lang];
  const link = (route) => pathInLang(route, lang);
  const pages = new Map();

  /** Home → this page, as BreadcrumbList data. */
  const crumbs = (trail) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, url], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: SITE_URL + link(url),
    })),
  });

  // ---- the pages that exist regardless of the catalogue ----
  // The listing pages also carry their links in the <noscript> block, so a
  // crawler's first pass reaches every veneer and project from them, not only
  // from the sitemap.
  const collections = [...new Set(PRODUCTS.map((p) => p.collectionLabel))];
  const staticNoscript = {
    '/products': [
      `  <h1>${esc(w.productsHeading)}</h1>`,
      `  <p>${esc(w.productsIntro(PRODUCTS.length, collections.join(', ')))}`,
      `     ${esc(w.standardSheet)} ${esc(DEFAULT_DIMENSION)}.</p>`,
      ...collections.flatMap((label) => [
        `  <h2>${esc(label)}</h2>`,
        '  <ul>',
        ...PRODUCTS.filter((p) => p.collectionLabel === label).map(
          (p) => `    <li><a href="${link(`/products/${esc(p.id)}`)}">${esc(p.name)}</a></li>`
        ),
        '  </ul>',
      ]),
    ].join('\n'),
    '/projects': [
      `  <h1>${esc(w.projectsHeading)}</h1>`,
      '  <ul>',
      ...PROJECTS.map(
        (p) =>
          `    <li><a href="${link(`/projects/${esc(p.id)}`)}">${esc(p.title)}</a>, ` +
          `${esc(pick(p, 'room', lang))} ${w.inRoom} ${esc(pick(p, 'location', lang))}</li>`
      ),
      '  </ul>',
    ].join('\n'),
    '/services': [
      `  <h1>${esc(w.servicesHeading)}</h1>`,
      ...SERVICES.flatMap((s) => [
        `  <h2>${esc(pick(s, 'title', lang))}</h2>`,
        `  <p>${esc(pick(s, 'desc', lang).trim())}</p>`,
      ]),
      `  <p><a href="${link('/products')}">${esc(w.browse)}</a> · <a href="${link('/contact')}">${esc(w.talk)}</a></p>`,
    ].join('\n'),
  };

  for (const [route, key] of Object.entries(STATIC_META_PATHS)) {
    const { title, description } = STATIC_META[lang][key];
    pages.set(route, {
      title,
      description,
      noscript: staticNoscript[route] || (lang === 'id' ? NOSCRIPT_ID : undefined),
    });
  }

  // ---- one veneer ----
  for (const product of PRODUCTS) {
    const route = `/products/${product.id}`;
    const name = shortProductName(product);
    const longDesc = pick(product, 'longDesc', lang);
    const description = clampDescription(longDesc);
    const image = socialImage(product.image);
    const dimension = product.dimension || DEFAULT_DIMENSION;
    const species = pick(product, 'species', lang);

    pages.set(route, {
      title: productTitle(product, lang),
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
          url: SITE_URL + link(route),
          sku: product.id,
          category: w.collectionCategory(product.collectionLabel),
          material: species || undefined,
          brand: { '@type': 'Brand', name: 'KAIU' },
          manufacturer: { '@id': `${SITE_URL}/#organization` },
          // Prices are quoted per project, so the offer states availability
          // and who sells it without inventing a number.
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            priceCurrency: 'IDR',
            url: SITE_URL + link(route),
            seller: { '@id': `${SITE_URL}/#organization` },
          },
          additionalProperty: [
            { '@type': 'PropertyValue', name: w.collection, value: product.collectionLabel },
            { '@type': 'PropertyValue', name: w.sheetSize, value: dimension },
            { '@type': 'PropertyValue', name: w.finish, value: pick(product, 'finish', lang) },
          ].filter((p) => p.value),
        },
      ],
      breadcrumbs: crumbs([
        [w.home, '/'],
        [w.products, '/products'],
        [product.collectionLabel, '/products'],
        [name, route],
      ]),
      noscript: [
        `  <h1>${esc(w.veneerName(product.name))}</h1>`,
        `  <p>${esc(longDesc)}</p>`,
        `  <p>${w.collection}: ${esc(product.collectionLabel)}. ${w.species}: ${esc(species)}.`,
        `     ${w.sheetSize}: ${esc(dimension)}.</p>`,
        `  <p><a href="${link('/products')}">${esc(w.allVeneers)}</a> · <a href="${link('/contact')}">${esc(w.requestSample)}</a></p>`,
      ].join('\n'),
    });
  }

  // ---- one project ----
  for (const project of PROJECTS) {
    const route = `/projects/${project.id}`;
    const longDesc = pick(project, 'longDesc', lang);
    const description = clampDescription(longDesc);
    const image = socialImage(project.images[0].src);
    const location = pick(project, 'location', lang);
    const room = pick(project, 'room', lang);
    const designer = pick(project, 'designer', lang);
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
          url: SITE_URL + link(route),
          locationCreated: { '@type': 'Place', name: location },
          about: room,
          creator: designer ? { '@type': 'Organization', name: designer } : undefined,
          provider: { '@id': `${SITE_URL}/#organization` },
          material: veneers.map((p) => p.name),
        },
      ],
      breadcrumbs: crumbs([
        [w.home, '/'],
        [w.projects, '/projects'],
        [project.title, route],
      ]),
      noscript: [
        `  <h1>${esc(project.title)}</h1>`,
        `  <p>${esc(w.roomIn(room, location, designer))}</p>`,
        `  <p>${esc(longDesc)}</p>`,
        veneers.length
          ? `  <p>${w.finishedIn} ${veneers
              .map((p) => `<a href="${link(`/products/${esc(p.id)}`)}">${esc(p.name)}</a>`)
              .join(', ')}.</p>`
          : '',
        `  <p><a href="${link('/projects')}">${esc(w.allProjects)}</a></p>`,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  return pages;
}

// ---- write one file per route, in each language ----
let written = 0;
for (const lang of ['en', 'id']) {
  const pages = buildPages(lang);
  for (const route of sitemapPaths(PRODUCTS, PROJECTS)) {
    const page = pages.get(route);
    if (!page) continue;
    const html = render(route, page, lang);
    // English "/" is dist/index.html itself; the rest get a folder with an index.
    const address = pathInLang(route, lang);
    const file = address === '/' ? path.join(DIST, 'index.html') : path.join(DIST, address, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    written += 1;
  }
}

// ---- the page for every address that is not one of the above ----
// Vercel answers any path with no file of its own with dist/404.html and a
// 404 status, so a mistyped or retired address is reported as missing rather
// than indexed as a copy of the home page. React still boots and shows the
// not-found page.
{
  let html = render('/', { ...STATIC_META.en.notFound, title: `${STATIC_META.en.notFound.title} - KAIU` });
  html = html
    .replace(/\s*<link rel="canonical" href="[^"]*">/, '')
    .replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '')
    .replace(/\s*<meta name="description" content="[^"]*">/, '')
    .replace('</title>', '</title>\n<meta name="robots" content="noindex">');
  fs.writeFileSync(path.join(DIST, '404.html'), html);
}

console.log(
  `\nprerender: ${written} pages in two languages, each with its own title, description, canonical, social card and structured data\n`
);
