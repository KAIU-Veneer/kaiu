import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Where the visitor was on each page, so that going back puts them where they
 * left rather than at the top. A browser does this by itself for ordinary
 * pages; here the whole page is replaced in place, so there is nothing for it
 * to restore and we keep the positions ourselves.
 *
 * Two records, because there are two ways of coming back. A step back in
 * history returns to one particular entry, and `byEntry` holds the position
 * for each of those separately — the same page visited twice and scrolled
 * differently gives two entries and two positions. A link that asks to resume
 * makes a new entry instead, with no position of its own, so `byPath` holds
 * the last position seen on each page for it to pick up.
 */
const byEntry = new Map();
const byPath = new Map();
const LIMIT = 50;

const record = (map, k, y) => {
  map.delete(k);
  map.set(k, y);
  // Map keeps insertion order, so the first key is the least recently used.
  if (map.size > LIMIT) map.delete(map.keys().next().value);
};

export default function ScrollToTop() {
  const { key, pathname, state } = useLocation();
  const navigationType = useNavigationType();
  const resuming = Boolean(state && state.resume);

  // Recorded as it happens rather than on the way out: by the time this page
  // is being left the next one is already in the document, and a shorter one
  // would have pinned the scroll back to the top before we could read it.
  useEffect(() => {
    const onScroll = () => {
      record(byEntry, key, window.scrollY);
      record(byPath, pathname, window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [key, pathname]);

  useEffect(() => {
    let wanted = 0;
    if (navigationType === 'POP') wanted = byEntry.get(key) || 0;
    else if (resuming) wanted = byPath.get(pathname) || 0;

    if (!wanted) {
      window.scrollTo(0, 0);
      return undefined;
    }

    // The page may still be growing when this runs — a route arriving, images
    // settling — and scrolling past the end of a short document lands short.
    // Keep asking for a few frames until the document can hold the position.
    let frames = 30;
    let raf = 0;
    const settle = () => {
      window.scrollTo(0, wanted);
      if (Math.round(window.scrollY) < wanted && frames > 0) {
        frames -= 1;
        raf = requestAnimationFrame(settle);
      }
    };
    settle();
    return () => cancelAnimationFrame(raf);
  }, [key, pathname, navigationType, resuming]);

  return null;
}
