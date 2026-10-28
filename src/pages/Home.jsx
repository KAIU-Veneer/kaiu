import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PROJECTS } from "../data.js";
import { useLanguage } from "../LanguageContext.jsx";
import useReveal from "../useReveal.js";
import { projectPhoto, IMAGE_SIZES } from "../imageSrc.js";
import useDocumentMeta from '../useDocumentMeta.js';
import "./Home.css";

const PROCESS = [
  { t: 'p1t', d: 'p1d', img: '/assets/image/process/veneer-samples.webp?v=3' },
  { t: 'p2t', d: 'p2d', img: '/assets/image/process/hot-press.webp?v=3', position: 'center 52%' },
  { t: 'p3t', d: 'p3d', img: '/assets/image/w800/OSLO CEMENT GREY OAK.webp?v=2' },
];

// Drawn for this list rather than taken from a stock set, so each one shows
// something about veneer itself: a log end, stacked sheets, a swatch fan and
// a finished panel. Same 1.5 stroke as the arrows.
const MATERIAL_ICONS = [
  // Real wood: the end of a log, uneven growth rings and a drying check.
  <svg key="log" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.3 3.6c4.7.2 8.3 3.9 8.1 8.6-.2 4.8-4 8.4-8.8 8.2-4.6-.2-8.2-4-8-8.7.2-4.8 4-8.3 8.7-8.1Z" /><path d="M12.6 7.4c2.6.3 4.4 2.5 4.1 5.1-.3 2.5-2.6 4.2-5.1 3.9-2.4-.3-4.1-2.5-3.8-4.9.3-2.6 2.5-4.4 4.8-4.1Z" /><path d="M12.2 11.2c.6 0 1 .5 1 1.1s-.5 1-1.1 1" /><path d="M12.4 3.7 13 8.2M13.4 9.6l.3 1.4" /></svg>,
  // Matches across sheets: three sheets stacked, the same grain line on each.
  <svg key="sheets" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15.5 12 19.5l8-4" /><path d="M4 12 12 16l8-4" /><path d="M12 4.5 20 8.5l-8 4-8-4 8-4Z" /><path d="M9 7.2l5 2.5" /></svg>,
  // Wide range: veneer strips fanned out from one pin, like a sample book.
  <svg key="fan" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 20.5 3.6 6.2a1 1 0 0 1 .8-1.1l2.3-.4a1 1 0 0 1 1.1.8L10 19.6" /><path d="M7.4 19.4 9.8 6.6a1 1 0 0 1 1.2-.8l2.3.4a1 1 0 0 1 .8 1.2l-2.4 12.4" /><path d="M9.5 19.6 16.8 9a1 1 0 0 1 1.4-.2l1.9 1.3a1 1 0 0 1 .3 1.4l-7.2 10.4" /><circle cx="7" cy="19.2" r=".9" /></svg>,
  // Durable and stable: a finished wall panel with its grain running through.
  <svg key="panel" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3.5" width="12" height="17" rx="1" /><path d="M9.2 3.5c-.9 3.4 1.4 5.2.4 8.6-.8 2.9.6 5.3.2 8.4" /><path d="M13.3 3.5c.8 2.8-.7 5 .1 7.8.9 3.1-.4 6 .3 9.2" /></svg>,
];

export default function Home() {
  const { t, lang } = useLanguage();
  useDocumentMeta(t.meta.home);

  useLayoutEffect(() => {
    const updateHeroHeight = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty(
        '--home-hero-height',
        `${Math.ceil(viewportHeight + 1)}px`
      );
    };

    updateHeroHeight();
    window.addEventListener('resize', updateHeroHeight);
    window.visualViewport?.addEventListener('resize', updateHeroHeight);
    return () => {
      window.removeEventListener('resize', updateHeroHeight);
      window.visualViewport?.removeEventListener('resize', updateHeroHeight);
      document.documentElement.style.removeProperty('--home-hero-height');
    };
  }, []);

  // The hero steps through the projects; the caption names the one shown.
  const heroProjects = PROJECTS;
  const [slide, setSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const current = heroProjects[slide];
  const go = (step) => setSlide((i) => (i + step + heroProjects.length) % heroProjects.length);

  useEffect(() => {
    if (heroProjects.length < 2) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let timer;
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      if (!heroPaused && !document.hidden && !reducedMotion.matches) {
        timer = window.setInterval(() => {
          // Hold still while the mobile menu covers the page.
          if (document.body.classList.contains('nav-is-open')) return;
          setSlide((index) => (index + 1) % heroProjects.length);
        }, 6500);
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
  }, [heroProjects.length, heroPaused, slide]);

  const materialRef = useReveal();
  const processRef = useReveal();
  const worksRef = useReveal();

  const worksTrackRef = useRef(null);
  const slideWorks = (direction) => {
    const track = worksTrackRef.current;
    const card = track?.querySelector('.work-card');
    if (!track || !card) return;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section
        className="hero"
        data-header-surface="colored"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        onFocusCapture={() => setHeroPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false);
        }}
      >
        <div className="hero-media">
          {heroProjects.map((pr, i) => (
            <img
              key={pr.id}
              {...projectPhoto(pr.images[0].src)}
              sizes="100vw"
              className={`hero-img${i === slide ? ' is-active' : ''}`}
              alt=""
              aria-hidden="true"
              fetchpriority={i === 0 ? 'high' : 'low'}
            />
          ))}
          <div className="hero-scrim" />
        </div>

        <div className="hero-copy">
          <h1>{t.home.heroTitle1}<br />{t.home.heroTitle2}</h1>
          <p>{t.home.heroDesc}</p>
          <div className="hero-actions">
            <Link to="/products" className="pill-btn">{t.home.exploreProducts} <span aria-hidden="true">→</span></Link>
            <Link to="/projects" className="pill-btn pill-btn-outline">{t.home.viewProjects}</Link>
          </div>
        </div>

        <div className="hero-caption">
          <div className="hero-caption-text">
            <span className="hero-caption-room">{lang === 'id' ? current.idRoom : current.room}</span>
            <span className="hero-caption-place">{lang === 'id' ? current.idLocation : current.location}</span>
          </div>
          <div className="hero-nav">
            <span className="hero-count" aria-hidden="true">
              {String(slide + 1).padStart(2, '0')}
              <span className="hero-rule" />
              {String(heroProjects.length).padStart(2, '0')}
            </span>
            <span className="sr-only">
              {t.a11y.slide.replace('{n}', slide + 1).replace('{total}', heroProjects.length)}
            </span>
            <button type="button" aria-label={t.a11y.prevProject} onClick={() => go(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m0 0 6 6m-6-6 6-6" /></svg>
            </button>
            <button type="button" aria-label={t.a11y.nextProject} onClick={() => go(1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- OUR MATERIAL ---------------- */}
      <section className="material reveal" data-header-surface="light" ref={materialRef}>
        <div className="material-copy">
          <h2>{t.home.materialTitle1}<br />{t.home.materialTitle2}</h2>
          <p>{t.home.materialDesc}</p>
          <ul className="material-list">
            {[['m1t','m1d'], ['m2t','m2d'], ['m3t','m3d'], ['m4t','m4d']].map(([title, desc], index) => (
              <li key={title}>
                <span className="material-icon">{MATERIAL_ICONS[index]}</span>
                <span>
                  <strong>{t.home[title]}</strong>
                  <span>{t.home[desc]}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link to="/products" className="text-cta">{t.home.exploreCollection} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="material-media" aria-hidden="true">
          <img src="/assets/image/our-material.webp" alt="" loading="lazy" decoding="async" />
        </div>
      </section>

      {/* ---------------- THE PROCESS ---------------- */}
      <section className="process reveal" data-header-surface="light" ref={processRef}>
        <div className="process-head">
          <div>
            <h2>{t.home.processTitle1}<br />{t.home.processTitle2}</h2>
          </div>
          <p>{t.home.processDesc}</p>
        </div>
        {/* An ordered list, so the order is announced without visible numbers;
            the titles and the arrows carry it on screen. */}
        <ol className="process-grid">
          {PROCESS.map((step, i) => (
            <li key={step.t} className="process-step">
              <img src={step.img} alt="" aria-hidden="true" loading="lazy" decoding="async" style={step.position ? { objectPosition: step.position } : undefined} />
              <div className="process-text">
                <div>
                  <h3>{t.home[step.t]}</h3>
                  <p>{t.home[step.d]}</p>
                </div>
              </div>
              {i < PROCESS.length - 1 && <span className="process-arrow" aria-hidden="true">→</span>}
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- FEATURED PROJECTS ---------------- */}
      <section className="works reveal" data-header-surface="light" ref={worksRef}>
        <div className="works-head">
          <div>
            <h2>{t.home.worksTitle1}<br />{t.home.worksTitle2}</h2>
          </div>
          <div className="works-actions">
            <Link to="/projects" className="text-cta">{t.home.viewAllProjects} <span aria-hidden="true">→</span></Link>
            <div className="works-controls" aria-label={t.a11y.projectControls}>
              <button type="button" aria-label={t.a11y.prevProjects} onClick={() => slideWorks(-1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m0 0 6 6m-6-6 6-6" /></svg>
              </button>
              <button type="button" aria-label={t.a11y.nextProjects} onClick={() => slideWorks(1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="works-track" ref={worksTrackRef} role="region" aria-roledescription="carousel" aria-label={`${t.home.worksTitle1} ${t.home.worksTitle2}`}>
          {PROJECTS.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="work-card">
              <div className="work-card-image">
                <img
                  {...projectPhoto(project.images[0].src)}
                  sizes={IMAGE_SIZES.projectLead}
                  width={project.images[0].w}
                  height={project.images[0].h}
                  alt={`${project.title}, ${lang === 'id' ? project.idRoom : project.room}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span className="work-card-meta">
                <span className="work-card-room">{lang === 'id' ? project.idRoom : project.room}</span>
                <span className="work-card-title">{project.title}</span>
                <span className="work-card-location">{lang === 'id' ? project.idLocation : project.location}</span>
              </span>
              <span className="work-card-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 12h14m0 0-6-6m6 6-6 6" /></svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="home-cta on-dark" data-header-surface="colored">
        <div className="home-cta-inner">
          <div>
            <h2>{t.home.ctaTitle}</h2>
            <p>{t.home.ctaDesc}</p>
          </div>
          <Link to="/contact" className="pill-btn">{t.home.ctaButton} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
