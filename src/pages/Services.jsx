import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, SERVICES } from '../data.js';
import { imageAt } from '../imageSrc.js';
import { useLanguage } from '../LanguageContext.jsx';
import useDocumentMeta from '../useDocumentMeta.js';
import WorkshopVideo from '../components/WorkshopVideo.jsx';
import './Services.css';

// The first section is a wall of sample sheets, edge to edge, with the
// heading and the three services on a panel laid over it.

// Two photographs of sample sheets on white, both 1448 × 1086. Each sheet
// is drawn as its own crop of its photograph, so it can lift on its own.
// Every crop is the same shape and taken from inside the sheet, clear of
// its edge, so sheets from both photographs sit together as one wall.
const PHOTO_W = 1448;
const PHOTO_H = 1086;

// Fifteen upright sheets: centre, and the largest crop that stays inside.
const GRID_PHOTO = '/assets/image/process/veneer-sample-grid.webp';
const GRID_SHEETS = [
  [67, 48, 311, 351], [345, 48, 590, 351], [611, 44, 835, 351], [856, 43, 1107, 351], [1133, 43, 1382, 345],
  [54, 368, 308, 687], [334, 369, 589, 687], [609, 368, 839, 687], [858, 367, 1116, 687], [1135, 367, 1397, 685],
  [48, 703, 301, 1032], [330, 701, 586, 1032], [608, 700, 841, 1033], [860, 700, 1119, 1033], [1145, 700, 1405, 1033],
].map(([l, t, r, b]) => [GRID_PHOTO, (l + r) / 2, (t + b) / 2, r - l - 28, b - t - 28]);

// A veneer from the range, shown from its own swatch photograph.
const veneer = (id) => {
  const product = PRODUCTS.find((p) => p.id === id);
  return product && { swatch: imageAt(product.image, 400) };
};

// Thirty sheets lying flat, six by five. The sculpted panel at the end of
// the first row is not a KAIU product and is left out. The two pale burls,
// and three of the many mid-brown stripes, give their places to veneers from
// the range, the stripes to blonde ones so the wall is not all dark.
const WALL_PHOTO = '/assets/image/process/veneer-sample-wall.webp';
const WALL_COLUMNS = [161, 391, 616, 841, 1066, 1291];
const WALL_ROWS = [157, 357, 554, 744, 938];
const WALL_SWAPS = {
  '2,4': 'zurich-crimson-red',
  '3,2': 'berlin-ashen-oak',
  '0,2': 'cannes-blonde-oak',
  '1,5': 'cannes-washed-oak',
  '4,4': 'cannes-sand-ash',
};
const WALL_SHEETS = WALL_ROWS.flatMap((y, row) =>
  WALL_COLUMNS.map((x, col) => {
    if (row === 0 && col === 5) return null;
    const swap = WALL_SWAPS[`${row},${col}`];
    return (swap && veneer(swap)) || [WALL_PHOTO, x, y, 192, 160];
  })
).filter(Boolean);

// Veneers from the range, light and dark, across all six collections.
const RANGE = [
  'cairo-crema-oak', 'athens-bark-walnut', 'cannes-oak-burl', 'zurich-walnut-grid', 'athens-java-smoked-oak',
  'cannes-golden-teak', 'zurich-black-pearl', 'cannes-sand-walnut', 'athens-fawn-ebony', 'oslo-cement-grey-oak',
  'zurich-moonstone', 'zurich-chasing-waves', 'zurich-sapphire', 'zurich-monochrome-tiles',
].map(veneer).filter(Boolean);

// One sheet from the upright set after every two lying flat, so the two
// photographs mix, and then every third place given to a veneer from the
// range. A wall takes only as many as it has room for.
const SHEETS = WALL_SHEETS.reduce((all, sheet, i) => {
  all.push(sheet);
  if (i % 2 === 1 && GRID_SHEETS[(i - 1) / 2]) all.push(GRID_SHEETS[(i - 1) / 2]);
  return all;
}, []).concat(GRID_SHEETS.slice(14))
  .map((sheet, i) => (i % 3 === 2 && RANGE[(i - 2) / 3]) || sheet);

/**
 * How many whole sheets fit the section, edge to edge: columns near the
 * target width, then as many rows as fill the height. The sheets take the
 * shape that is left, which stays close to the photographs' own.
 */
const wallLayout = (width, height) => {
  const wide = width > 900;
  const gap = wide ? 8 : 4;
  const target = wide ? 172 : 86;
  const cols = Math.max(3, Math.round((width - gap) / (target + gap)));
  const tileW = (width - gap * (cols + 1)) / cols;
  const rows = Math.max(1, Math.round((height - gap) / (tileW / 1.2 + gap)));
  const tileH = (height - gap * (rows + 1)) / rows;
  return { cols, rows, gap, ratio: tileW / tileH };
};

const pct = (n) => `${n * 100}%`;
const sampleStyle = (sheet, ratio) => {
  // A veneer's own swatch is a whole photograph of the sheet: it fills the
  // place and is trimmed to its shape.
  if (sheet.swatch) {
    return { backgroundImage: `url("${sheet.swatch}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  const [photo, x, y, maxW, maxH] = sheet;
  const w = Math.min(maxW, maxH * ratio);
  const h = w / ratio;
  const l = x - w / 2;
  const t = y - h / 2;
  return {
    backgroundImage: `url("${photo}")`,
    backgroundSize: `${pct(PHOTO_W / w)} ${pct(PHOTO_H / h)}`,
    backgroundPosition: `${pct(l / (PHOTO_W - w))} ${pct(t / (PHOTO_H - h))}`,
  };
};

// Touch has no hover, so a tap lifts the sheet briefly and lets it settle.
// Restarting the animation lets a second tap lift it again mid-way.
const liftOnTap = (event) => {
  if (event.pointerType === 'mouse') return;
  const sheet = event.currentTarget;
  sheet.classList.remove('is-tapped');
  void sheet.offsetWidth;
  sheet.classList.add('is-tapped');
};
const settle = (event) => event.currentTarget.classList.remove('is-tapped');

export default function Services() {
  const { t, lang } = useLanguage();
  useDocumentMeta(t.meta.services);

  // The wall is laid out for the section's size, and again whenever it
  // changes, so it always ends on whole sheets.
  const introRef = useRef(null);
  const [wall, setWall] = useState(null);
  useLayoutEffect(() => {
    const section = introRef.current;
    const measure = () => {
      const next = wallLayout(section.clientWidth, section.clientHeight);
      setWall((prev) => (prev && prev.cols === next.cols && prev.rows === next.rows
        && Math.abs(prev.ratio - next.ratio) < 0.01 ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="services-page">
      <section className="services-intro" ref={introRef}>
        {wall && (
          <div
            className="services-wall"
            aria-hidden="true"
            style={{
              gridTemplateColumns: `repeat(${wall.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${wall.rows}, minmax(0, 1fr))`,
              gap: wall.gap,
              padding: wall.gap,
            }}
          >
            {Array.from({ length: wall.cols * wall.rows }, (_, i) => (
              <span key={i} className="services-sample" style={sampleStyle(SHEETS[(i * 7) % SHEETS.length], wall.ratio)}
                    onPointerDown={liftOnTap} onAnimationEnd={settle} />
            ))}
          </div>
        )}
        <div className="services-panel">
          <header className="services-head">
            <h1>{t.services.title}</h1>
            <p>{t.services.intro}</p>
          </header>
          <ol className="services-list">
            {SERVICES.map((s, i) => (
              <li key={s.title}>
                <h2>{lang === 'id' ? s.idTitle : s.title}</h2>
                <p>{(lang === 'id' ? s.idDesc : s.desc).trim()}</p>
                {i === 0 && (
                  <Link to="/products" className="text-cta">{t.home.exploreCollection} <span aria-hidden="true">→</span></Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <WorkshopVideo />

      <section className="services-cta">
        <div>
          <h2>{t.home.ctaTitle}</h2>
          <p>{t.home.ctaDesc}</p>
        </div>
        <Link to="/contact" className="pill-btn">{t.home.ctaButton} <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
