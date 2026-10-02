import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from './siteMeta.js';

/**
 * Gives the page its own title, description and canonical link.
 *
 * Every route is served the same index.html, so without this all 225 pages
 * claim the same title and the same description — the line a search result
 * shows, and the strongest thing a page says about itself. The crawler reads
 * the document after the scripts have run, so setting it here is enough.
 *
 * The canonical link names the one address a page should be known by. It
 * matters here because the same page answers on more than one URL: a swatch
 * carries a ?v= on its photographs, a visitor may arrive at the address that
 * redirects, and a stray query from a campaign link would otherwise look like
 * a page of its own.
 */
const head = (selector, create) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

const meta = (name) =>
  head(`meta[name="${name}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('name', name);
    return el;
  });

export default function useDocumentMeta({ title, description, noindex = false }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (title) document.title = title;

    // Removed rather than left alone when a page has none, or the description
    // of whichever page came before would stay behind and describe this one.
    const existing = document.head.querySelector('meta[name="description"]');
    if (description) meta('description').setAttribute('content', description);
    else if (existing) existing.remove();

    head('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    }).setAttribute('href', SITE_URL + pathname);

    // Only the not-found page asks to be left out, and the tag has to go again
    // when the visitor moves on, or the next page inherits it.
    const robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) meta('robots').setAttribute('content', 'noindex');
    else if (robots) robots.remove();
  }, [title, description, noindex, pathname]);
}
