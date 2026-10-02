/**
 * Pairs an `src` and a `srcSet` for a photograph, so a browser downloads a
 * copy near the size it is about to draw rather than the original.
 *
 * The originals stay at the size they arrived; `npm run images` writes the
 * narrower copies this reaches for. Each place that shows a photograph names
 * the narrowest copy it is willing to display as well as the set to choose
 * from: React writes `src` before `srcset` and the browser starts fetching on
 * sight of `src`, so that floor is what a browser settles on if it never
 * reconsiders, and the rest of the set is an upgrade for a dense screen.
 */

/** `/assets/x/1.webp?v=2` and 800 -> `/assets/x/w800/1.webp?v=2`. */
const variant = (image, width) => {
  const [file, query] = image.split('?');
  const cut = file.lastIndexOf('/');
  return `${file.slice(0, cut)}/w${width}${file.slice(cut)}${query ? `?${query}` : ''}`;
};

// 'full' is the original. Its descriptor is the width of the common original
// in that set; the few that are narrower are still the largest that exists,
// which is all the descriptor has to rank.
const candidate = (image, width, fullWidth) =>
  width === 'full' ? `${image} ${fullWidth}w` : `${variant(image, width)} ${width}w`;

const pick = (image, widths, fullWidth) => ({
  src: variant(image, widths[0]),
  srcSet: widths.map((w) => candidate(image, w, fullWidth)).join(', '),
});

/**
 * A veneer swatch in one of the card grids: small on screen and many to a
 * page, so the narrowest copy is the floor.
 */
export const cardSwatch = (image) => pick(image, [400, 800], 2160);

/**
 * The swatch on a product's own page, where it fills half the width and is
 * the thing the visitor came to look at. The floor is the 800 so it is never
 * soft, and the original is offered to screens that can use it.
 */
export const visualSwatch = (image) => pick(image, [800, 'full'], 2160);

/**
 * A project photograph, on a card or on the project's own page. Both draw it
 * at a few hundred pixels, so the 800 is the floor, with the 1600px original
 * behind it for dense screens and for the gallery's larger frames.
 */
export const projectPhoto = (image) => pick(image, [800, 'full'], 1600);

/** How wide a photograph is drawn in each place one appears. */
export const IMAGE_SIZES = {
  heroSwatch: '(max-width: 760px) 28vw, 193px',
  cardSwatch: '(max-width: 900px) 46vw, 24vw',
  productVisual: '(max-width: 900px) min(92vw, 420px), 46vw',
  projectCard: '(max-width: 900px) 92vw, 31vw',
  projectLead: '(max-width: 900px) 92vw, 46vw',
  projectGallery: '(max-width: 640px) 92vw, 46vw',
};
