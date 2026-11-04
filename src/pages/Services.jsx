import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import useDocumentMeta from '../useDocumentMeta.js';
import WorkshopVideo from '../components/WorkshopVideo.jsx';
import './Services.css';

// Kept plain: the heading and the three services as text in one column,
// beside a photograph of fifteen sample sheets laid out in rows.

const GRID_PHOTO = '/assets/image/process/veneer-sample-grid.webp';
const PHOTO_W = 1448;
const PHOTO_H = 1086;
// Where each sample sits in the photograph, in its pixels: left, top,
// right, bottom, measured from the image with a little margin. Each sample
// is drawn as its own crop of the photograph so it can lift on its own;
// the white between them is never drawn and the page shows through.
const SAMPLES = [
  [67, 48, 311, 351], [345, 48, 590, 351], [611, 44, 835, 351], [856, 43, 1107, 351], [1133, 43, 1382, 345],
  [54, 368, 308, 687], [334, 369, 589, 687], [609, 368, 839, 687], [858, 367, 1116, 687], [1135, 367, 1397, 685],
  [48, 703, 301, 1032], [330, 701, 586, 1032], [608, 700, 841, 1033], [860, 700, 1119, 1033], [1145, 700, 1405, 1033],
].map(([l, t, r, b]) => [l - 2, t - 2, r + 2, b + 2]);

const pct = (n) => `${n * 100}%`;
const sampleStyle = ([l, t, r, b]) => {
  const w = r - l;
  const h = b - t;
  return {
    left: pct(l / PHOTO_W),
    top: pct(t / PHOTO_H),
    width: pct(w / PHOTO_W),
    height: pct(h / PHOTO_H),
    backgroundImage: `url("${GRID_PHOTO}")`,
    backgroundSize: `${pct(PHOTO_W / w)} ${pct(PHOTO_H / h)}`,
    backgroundPosition: `${pct(l / (PHOTO_W - w))} ${pct(t / (PHOTO_H - h))}`,
  };
};

export default function Services() {
  const { t, lang } = useLanguage();
  useDocumentMeta(t.meta.services);

  return (
    <div className="services-page">
      <section className="services-intro">
        <header className="services-head">
          <h1>{t.services.title}</h1>
          <p>{t.services.intro}</p>
        </header>
        <div className="services-photo" aria-hidden="true">
          {SAMPLES.map((box) => (
            <span key={box.join()} className="services-sample" style={sampleStyle(box)} />
          ))}
        </div>
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
