import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import useReveal from '../useReveal.js';
import useDocumentMeta from '../useDocumentMeta.js';
import { PRODUCTS } from '../data.js';
import { cardSwatch, projectPhoto } from '../imageSrc.js';
import './About.css';

/* Both bands use real project photography rather than stock: the hero holds on
   the Teazzi veneer wall, the closing band cycles through the whole portfolio. */
const heroShot = PROJECTS.find((p) => p.id === 'teazzi-bandung') || PROJECTS[0];
/* Hand-picked rather than one-per-project, so the band avoids the storefront
   shots and never shows the same green swatch twice. */
const ALL_PROJECT_IMAGES = PROJECTS.flatMap((project) => project.images);
const CTA_SHOTS = [
  '/assets/projects/jln-denpasar-kuningan/6.webp',
  '/assets/projects/teazzi/6.webp',
  '/assets/projects/teazzi-bandung/10.webp',
  '/assets/projects/jln-denpasar-kuningan/3.webp',
  '/assets/projects/teazzi-bandung/7.webp',
]
  .map((src) => ALL_PROJECT_IMAGES.find((image) => image.src === src))
  .filter(Boolean);
/* One real sheet for each of the four points, in their order: a figured
   burl for the look of real wood, a straight-grained oak for consistency, a
   colour no tree grows for range, and a dark smoked oak for stability. */
const POINT_SHEETS = ['cannes-oak-burl', 'oslo-cement-grey-oak', 'zurich-sapphire', 'athens-java-smoked-oak']
  .map((id) => PRODUCTS.find((product) => product.id === id));
/* The reasons sit beside a finished green wall from the Jalan Denpasar
   residence. */
const WHY_SHOT = '/assets/projects/jln-denpasar-kuningan/5.webp';

export default function About() {
  const { t } = useLanguage();
  useDocumentMeta(t.meta.about);
  const [ctaSlide, setCtaSlide] = useState(0);
  const [ctaPaused, setCtaPaused] = useState(false);
  const [ctaDone, setCtaDone] = useState(false);

  // The closing band steps once through the projects on the same three-second
  // beat as the home and projects heroes, holds still while the pointer or
  // keyboard focus is on it, and comes to rest on the first photograph.
  useEffect(() => {
    if (CTA_SHOTS.length < 2) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      if (!ctaDone && !ctaPaused && !document.hidden && !reducedMotion.matches) {
        timer = window.setInterval(() => {
          if (document.body.classList.contains('nav-is-open')) return;
          // One pass through the projects, then rest on the first one, so
          // nothing keeps moving beside the words indefinitely.
          setCtaSlide((index) => {
            if (index + 1 >= CTA_SHOTS.length) {
              setCtaDone(true);
              return 0;
            }
            return index + 1;
          });
        }, 3000);
      }
    };
    const onVisibilityChange = () => (document.hidden ? stop() : start());
    const onMotionChange = (event) => (event.matches ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener?.('change', onMotionChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener?.('change', onMotionChange);
    };
  }, [ctaPaused, ctaDone]);

  // The material scene is pinned while it scrolls past; its progress (0 → 1)
  // goes into --p, and the CSS turns that into the headline filling in and
  // the panels rising out of the page.
  const sceneRef = useRef(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    const update = () => {
      frame = undefined;
      if (reducedMotion.matches) {
        scene.style.setProperty('--p', '1');
        return;
      }
      const rect = scene.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress = travel > 0 ? -rect.top / travel : 1;
      scene.style.setProperty('--p', Math.min(1, Math.max(0, progress)).toFixed(4));
    };
    const schedule = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener?.('change', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener?.('change', schedule);
    };
  }, []);

  // Each headline word gets its own index so it can fill in on its turn.
  const titleLines = [t.about.materialTitle1, t.about.materialTitle2].map((line) => line.split(' '));
  const titleWordCount = titleLines.flat().length;
  let wordIndex = 0;
  // The statement's first sentence is set in ink, the rest in the muted tone.
  const [noteLead, ...noteRest] = t.about.materialP2.split(/(?<=\.)\s+/);

  const whyRef = useReveal();
  const specRef = useReveal();

  return (
    <div className="about-page">
      {/* ---------------- HERO ----------------
          The words sit on the page's own ivory and the photograph fills the
          right side, washed into the ivory behind the words, the same glow
          the Projects hero uses. */}
      <section className="about-hero" data-header-surface="light">
        <img
          {...projectPhoto(heroShot.images[1] ? heroShot.images[1].src : heroShot.images[0].src)}
          sizes="(max-width: 900px) 100vw, 64vw"
          className="about-hero-img"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <div className="about-hero-wash" aria-hidden="true" />
        <div className="about-hero-copy">
          <h1>{t.about.title}</h1>
          <p>{t.about.lede}</p>
        </div>
      </section>

      {/* ---------------- OUR MATERIAL ---------------- */}
      <section className="material-scene" ref={sceneRef} style={{ '--n': titleWordCount }}>
        <div className="material-stage">
          <h2 className="material-title">
            {titleLines.map((words, line) => (
              <span key={line} className="material-title-line">
                {words.map((word) => (
                  <span key={wordIndex} className="material-word" style={{ '--i': wordIndex++ }}>{word} </span>
                ))}
              </span>
            ))}
          </h2>
          <img
            src="/assets/image/about/veneer-panels-tight.webp"
            width="1672"
            height="641"
            className="material-panels"
            alt=""
            aria-hidden="true"
            decoding="async"
          />
        </div>
      </section>

      {/* Straight on from the scene: the statement, centred under the
          centred headline, then the four points, each shown on a real sheet
          from the range, as if the panels above had been picked up. */}
      <section className="about-material">
        <p className="about-material-note">
          <span>{noteLead}</span> {noteRest.join(' ')}
        </p>
        <ul className="about-points">
          {t.about.points.map(([, title, desc], i) => {
            const sheet = POINT_SHEETS[i];
            const swatch = sheet && cardSwatch(sheet.image);
            return (
              <li key={title}>
                {sheet && (
                  <Link to={`/products/${sheet.id}`} className="about-point-sheet" aria-label={sheet.name}>
                    <img src={swatch.src} srcSet={swatch.srcSet} sizes="(max-width: 640px) 44vw, (max-width: 900px) 30vw, 22vw" alt="" loading="lazy" decoding="async" />
                  </Link>
                )}
                <h3>{title}</h3>
                <p>{desc}</p>
                {sheet && <span className="about-point-name">{sheet.name}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------------- WHY KAIU ----------------
          A finished wall from a KAIU project beside the reasons. */}
      <section className="about-why on-dark reveal" ref={whyRef}>
        <div className="about-why-photo">
          <img
            {...projectPhoto(WHY_SHOT)}
            sizes="(max-width: 900px) 100vw, 40vw"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="about-why-copy">
          <h2>{t.about.whyTitle1}<br />{t.about.whyTitle2}</h2>
          <ul className="about-why-list">
            {t.about.why.map(([title, desc]) => (
              <li key={title} className="about-why-item">
                <h3>{title}</h3>
                <p>{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- SPECIFICATION ---------------- */}
      <section className="about-spec reveal" ref={specRef}>
        <h2>{t.about.specTitle}</h2>
        <div className="about-spec-scroll">
          <table className="spec-table">
            <caption>{t.about.specCaption}</caption>
            <tbody>
              {t.about.spec.map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">{key}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section
        className="about-cta on-dark"
        data-header-surface="colored"
        onMouseEnter={() => setCtaPaused(true)}
        onMouseLeave={() => setCtaPaused(false)}
        onFocusCapture={() => setCtaPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setCtaPaused(false);
        }}
      >
        <div className="about-cta-media" aria-hidden="true">
          {CTA_SHOTS.map((shot, index) => (
            <img
              key={shot.src}
              {...projectPhoto(shot.src)}
              sizes="100vw"
              className={`about-cta-img${index === ctaSlide ? ' is-active' : ''}`}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
        <div className="about-cta-scrim" aria-hidden="true" />
        <div className="about-cta-copy">
          <div>
            <h2>{t.about.ctaTitle}</h2>
            <p>{t.about.ctaDesc}</p>
          </div>
          <Link to="/contact" className="pill-btn">{t.about.ctaButton} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
