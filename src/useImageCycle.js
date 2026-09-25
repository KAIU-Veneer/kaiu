import { useEffect, useRef, useState } from 'react';

/**
 * Steps through `count` images on a timer, so a card shows the whole project
 * instead of one photo of it. The timer only runs while the element is on
 * screen, and never starts for visitors who prefer reduced motion.
 *
 * Returns [ref to attach to the card, index of the image to show].
 */
export default function useImageCycle(count, delay = 4200) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || count < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let timer = null;
    const start = () => {
      if (!timer) timer = setInterval(() => setIndex((i) => (i + 1) % count), delay);
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };

    if (!('IntersectionObserver' in window)) {
      start();
      return stop;
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.25 });
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [count, delay]);

  return [ref, index % count];
}
