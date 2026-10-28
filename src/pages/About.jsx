import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import useReveal from '../useReveal.js';
import useDocumentMeta from '../useDocumentMeta.js';
import { projectPhoto, IMAGE_SIZES } from '../imageSrc.js';
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

export default function About() {
  const { t } = useLanguage();
  useDocumentMeta(t.meta.about);
  const [ctaSlide, setCtaSlide] = useState(0);

  // The closing band steps through the projects on its own, on the same
  // three-second beat as the home and projects heroes.
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
      if (!document.hidden && !reducedMotion.matches) {
        timer = window.setInterval(() => {
          if (document.body.classList.contains('nav-is-open')) return;
          setCtaSlide((index) => (index + 1) % CTA_SHOTS.length);
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
  }, []);

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

  const materialRef = useReveal();
  const whyRef = useReveal();
  const specRef = useReveal();

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="about-hero" data-header-surface="colored">
        <img
          {...projectPhoto(heroShot.images[1] ? heroShot.images[1].src : heroShot.images[0].src)}
          sizes="100vw"
          className="about-hero-img"
          alt=""
          aria-hidden="true"
        />
        <div className="about-hero-scrim" aria-hidden="true" />
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
            src="/assets/image/about/veneer-panels.webp"
            width="1672"
            height="941"
            className="material-panels"
            alt=""
            aria-hidden="true"
            decoding="async"
          />
        </div>
      </section>

      <section className="about-material reveal" ref={materialRef}>
        <p className="about-material-note">
          <span>{noteLead}</span> {noteRest.join(' ')}
        </p>
        <ul className="about-points">
          {t.about.points.map(([num, title, desc]) => (
            <li key={num}>
              <span className="about-point-num">{num}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- WHY KAIU ---------------- */}
      <section className="about-why on-dark reveal" ref={whyRef}>
        <div className="about-why-head">
          <h2>{t.about.whyTitle1}<br />{t.about.whyTitle2}</h2>
        </div>
        <div className="about-why-grid">
          {t.about.why.map(([title, desc]) => (
            <div key={title} className="about-why-item">
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
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
      <section className="about-cta" data-header-surface="colored">
        <div className="about-cta-media" aria-hidden="true">
          {CTA_SHOTS.map((shot, index) => (
            <img
              key={shot.src}
              {...projectPhoto(shot.src)}
              sizes={IMAGE_SIZES.projectLead}
              className={`about-cta-img${index === ctaSlide ? ' is-active' : ''}`}
              alt=""
              decoding="async"
              fetchpriority="low"
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
