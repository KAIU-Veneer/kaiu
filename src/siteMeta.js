/**
 * The one address the site calls itself by, and the rules for the title and
 * description each page carries.
 *
 * Shared with scripts/build-sitemap.mjs, which is why this file is plain
 * JavaScript with no JSX: Node imports it directly when it writes the sitemap.
 *
 * The apex redirects to www, so www is what every canonical link and every
 * sitemap entry must say. Pointing them at the address that redirects would
 * split one page's standing across two URLs.
 */
export const SITE_URL = 'https://www.kaiuveneer.co.id';

/** Appended to every title, so a result reads as one site. */
export const TITLE_SUFFIX = 'KAIU';

/**
 * What a search result shows for each page that is not a veneer or a project;
 * those two take their wording from the catalogue itself.
 *
 * It lives here rather than in LanguageContext so the prerender step can read
 * it: that script runs in Node, which cannot import a file containing JSX.
 * LanguageContext imports it straight back as `t.meta`.
 */
export const STATIC_META = {
  en: {
    home: {
      title: 'KAIU - Wood Veneer Supplier in Jakarta',
      description: 'KAIU supplies premium wood veneer to architects, designers, manufacturers and homeowners in Jakarta. Six collections, consistent sheet after sheet.',
    },
    about: {
      title: 'About KAIU - More Than a Surface',
      description: 'How KAIU selects veneer logs, slices them and pairs each face, for people who want the character of real timber without compromise.',
    },
    products: {
      title: 'Wood Veneer Collections - Oak, Walnut and Burl - KAIU',
      description: 'Browse every KAIU wood veneer across six collections, Athens, Berlin, Cairo, Cannes, Oslo and Zurich, from pale oak to smoke-dark walnut.',
    },
    projects: {
      title: 'Projects - Interiors Finished in KAIU Veneer',
      description: 'Recent fit-outs across Jakarta in KAIU veneer, from a private residence in Kuningan to a tea shop in Ciputra Mall and a restaurant in Blok M.',
    },
    services: {
      title: 'Veneer Services - Supply, Panels and Finishing - KAIU',
      description: 'Veneer supply, matching, pressing and finishing. What KAIU can take on between choosing a sheet and installing the surface.',
    },
    contact: {
      title: 'Contact KAIU - Wood Veneer, North Jakarta',
      description: 'Talk to the KAIU team about a project or request a sample. Studio in Pluit, North Jakarta, open Monday to Friday.',
    },
    notFound: { title: 'Page Not Found', description: '' },
  },
  id: {
    home: {
      title: 'KAIU - Supplier Veneer Kayu di Jakarta',
      description: 'KAIU memasok veneer kayu premium untuk arsitek, desainer, produsen, dan pemilik rumah di Jakarta. Enam koleksi, konsisten dari lembar ke lembar.',
    },
    about: {
      title: 'Tentang KAIU - Lebih dari Sekadar Permukaan',
      description: 'Bagaimana KAIU memilih log veneer, mengirisnya, dan memasangkan setiap permukaan, untuk mereka yang menginginkan karakter kayu asli tanpa kompromi.',
    },
    products: {
      title: 'Koleksi Veneer Kayu - Oak, Walnut dan Burl - KAIU',
      description: 'Jelajahi seluruh veneer KAIU dalam enam koleksi, dari oak Skandinavia yang pucat hingga walnut gelap berasap. Lembaran resolusi tinggi dan tampilan ruangan.',
    },
    projects: {
      title: 'Proyek - Interior dengan Veneer KAIU',
      description: 'Pengerjaan terbaru di Jakarta dengan veneer KAIU, dari hunian pribadi di Kuningan hingga kedai teh di Mal Ciputra dan restoran di Blok M.',
    },
    services: {
      title: 'Layanan Veneer - Suplai, Panel dan Finishing - KAIU',
      description: 'Penyediaan veneer, pencocokan, pengepresan, dan finishing. Apa yang dapat KAIU kerjakan antara memilih lembaran dan memasang permukaannya.',
    },
    contact: {
      title: 'Hubungi KAIU - Veneer Kayu, Jakarta Utara',
      description: 'Bicarakan proyek Anda dengan tim KAIU atau minta sampel. Studio di Pluit, Jakarta Utara, buka Senin sampai Jumat.',
    },
    notFound: { title: 'Halaman Tidak Ditemukan', description: '' },
  },
};

/** Which static path each STATIC_META key answers on. */
export const STATIC_META_PATHS = {
  '/': 'home',
  '/about': 'about',
  '/products': 'products',
  '/projects': 'projects',
  '/services': 'services',
  '/contact': 'contact',
};

/** The paths that exist regardless of the catalogue. */
export const STATIC_PATHS = ['/', '/about', '/products', '/projects', '/services', '/contact'];

/**
 * A description is cut to fit what a search result shows, at a word boundary
 * so it does not end mid-word. Google shortens anything longer anyway, and
 * choosing where it stops reads better than letting it fall where it may.
 */
export function clampDescription(text, limit = 155) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** "Oslo Cement Grey" -> "Cement Grey", the name as the page shows it. */
export const shortProductName = (product) =>
  product.name.startsWith(`${product.collectionLabel} `)
    ? product.name.slice(product.collectionLabel.length + 1)
    : product.name;

/** The title bar for one veneer, e.g. "Cement Grey Veneer - Oslo - KAIU",
    or "Veneer Cement Grey - Oslo - KAIU" in Indonesian word order. */
export const productTitle = (product, lang = 'en') =>
  lang === 'id'
    ? `Veneer ${shortProductName(product)} - ${product.collectionLabel} - ${TITLE_SUFFIX}`
    : `${shortProductName(product)} Veneer - ${product.collectionLabel} - ${TITLE_SUFFIX}`;

/** The title bar for one project, e.g. "Teazzi - Blok M - KAIU". */
export const projectTitle = (project) => `${project.title} - ${TITLE_SUFFIX}`;

/** Every page the sitemap should list, in the order a visitor would meet them. */
export const sitemapPaths = (products, projects) => [
  ...STATIC_PATHS,
  ...projects.map((p) => `/projects/${p.id}`),
  ...products.map((p) => `/products/${p.id}`),
];

/**
 * The two languages each have their own address: English at the root, the
 * same page in Indonesian under /id. A search engine can only rank what has
 * an address, so a language chosen by a switch alone is invisible to anyone
 * searching in it.
 */
export const LANG_PREFIX = { en: '', id: '/id' };

export const langFromPath = (pathname) =>
  pathname === '/id' || pathname.startsWith('/id/') ? 'id' : 'en';

/** `/id/products/x` -> `/products/x`; `/id` -> `/`. */
export const withoutLang = (pathname) =>
  langFromPath(pathname) === 'id' ? pathname.slice(3) || '/' : pathname;

/** `/products/x` and 'id' -> `/id/products/x`; `/` and 'id' -> `/id`. */
export const pathInLang = (route, lang) =>
  LANG_PREFIX[lang] + (route === '/' && LANG_PREFIX[lang] ? '' : route);
