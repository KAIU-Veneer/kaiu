import { useEffect, useState } from 'react';

/**
 * Steps through `count` images on a timer, so a card shows the whole project
 * instead of one photo of it. The timer runs whether or not the card is on
 * screen, so every project is at the same point in its cycle and none of them
 * restarts from the first photograph when it is scrolled to. It never starts
 * for visitors who prefer reduced motion.
 *
 * Returns the index of the image to show.
 */
export default function useImageCycle(count, delay = 4200) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = setInterval(() => setIndex((i) => (i + 1) % count), delay);
    return () => clearInterval(timer);
  }, [count, delay]);

  return index % count;
}
