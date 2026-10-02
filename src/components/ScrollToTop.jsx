import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Where the visitor was on each page they have open in their history, so that
 * going back puts them where they left rather than at the top. A browser does
 * this by itself for ordinary pages; here the whole page is replaced in place,
 * so there is nothing for it to restore and we keep the positions ourselves.
 *
 * Keyed by the router's own key, which is one per history entry: going to the
 * same page twice gives two entries and two positions, which is what you want
 * when the two visits were scrolled differently.
 */
const positions = new Map();
const LIMIT = 50;

const remember = (key, y) => {
  positions.delete(key);
  positions.set(key, y);
  // Map keeps insertion order, so the first key is the least recently used.
  if (positions.size > LIMIT) positions.delete(positions.keys().next().value);
};

export default function ScrollToTop() {
  const { key } = useLocation();
  const navigationType = useNavigationType();

  // Recorded as it happens rather than on the way out: by the time this page
  // is being left the next one is already in the document, and a shorter one
  // would have pinned the scroll back to the top before we could read it.
  useEffect(() => {
    const onScroll = () => remember(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [key]);

  useEffect(() => {
    const wanted = navigationType === 'POP' ? positions.get(key) : 0;
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
  }, [key, navigationType]);

  return null;
}
