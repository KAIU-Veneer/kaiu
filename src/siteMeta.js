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

/** The title bar for one veneer, e.g. "Cement Grey Veneer | Oslo | KAIU". */
export const productTitle = (product) =>
  `${shortProductName(product)} Veneer | ${product.collectionLabel} | ${TITLE_SUFFIX}`;

/** The title bar for one project, e.g. "Teazzi | KAIU". */
export const projectTitle = (project) => `${project.title} | ${TITLE_SUFFIX}`;

/** Every page the sitemap should list, in the order a visitor would meet them. */
export const sitemapPaths = (products, projects) => [
  ...STATIC_PATHS,
  ...projects.map((p) => `/projects/${p.id}`),
  ...products.map((p) => `/products/${p.id}`),
];
