import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PROJECTS } from "../data.js";
import { useLanguage } from "../LanguageContext.jsx";
import useReveal from "../useReveal.js";
import { projectPhoto, IMAGE_SIZES } from "../imageSrc.js";
import useDocumentMeta from '../useDocumentMeta.js';
import "./Home.css";

const PROCESS = [
  { n: '01', t: 'p1t', d: 'p1d', img: '/assets/image/w800/OSLO SILK GRAIN OAK.webp' },
  { n: '02', t: 'p2t', d: 'p2d', img: '/assets/image/w800/CANNES GOLDEN WALNUT.webp' },
  { n: '03', t: 'p3t', d: 'p3d', img: '/assets/image/w800/OSLO CEMENT GREY OAK.webp?v=2' },
];

const MATERIAL_ICONS = [
  <svg key="wood" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z M4.5 7.8 12 12l7.5-4.2M12 12v8.5" /></svg>,
  <svg key="quality" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 14.6 5l3-.1.9 2.8 2.2 2-1.1 2.8.5 2.9-2.6 1.4-1.5 2.6-3-.5-2.8 1-2-2.2-2.9-.8.1-3-1.5-2.6 1.6-2.5.2-3 2.9-.7L9.1 5l2.9.6Z M8.5 12.2l2.3 2.3 4.8-5" /></svg>,
  <svg key="options" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5c2.5 2.3 3.3 4.2 0 8.5-3.3-4.3-2.5-6.2 0-8.5Zm8.5 8.5c-2.3 2.5-4.2 3.3-8.5 0 4.3-3.3 6.2-2.5 8.5 0ZM12 20.5c-2.5-2.3-3.3-4.2 0-8.5 3.3 4.3 2.5 6.2 0 8.5ZM3.5 12c2.3-2.5 4.2-3.3 8.5 0-4.3 3.3-6.2 2.5-8.5 0Z" /></svg>,
  <svg key="durable" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z M8.7 12.1l2.2 2.2 4.6-4.7" /></svg>,
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
  // Hover and focus pause the slides for a moment; this button stops them
  // until the visitor plays them again, which is the only option on a phone.
  const [heroStopped, setHeroStopped] = useState(false);
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
      if (!heroPaused && !heroStopped && !document.hidden && !reducedMotion.matches) {
        timer = window.setInterval(() => {
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
  }, [heroProjects.length, heroPaused, heroStopped, slide]);

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
          <span className="eyebrow">{t.home.eyebrow}</span>
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
            <button
              type="button"
              className="hero-play"
              aria-label={heroStopped ? t.a11y.playSlides : t.a11y.pauseSlides}
              onClick={() => setHeroStopped((stopped) => !stopped)}
            >
              {heroStopped
                ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5L8 5.5Z" /></svg>
                : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12" /></svg>}
            </button>
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
          <span className="eyebrow">{t.home.materialEyebrow}</span>
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
            <span className="eyebrow">{t.home.processEyebrow}</span>
            <h2>{t.home.processTitle1}<br />{t.home.processTitle2}</h2>
          </div>
          <p>{t.home.processDesc}</p>
        </div>
        <div className="process-grid">
          {PROCESS.map((step, i) => (
            <div key={step.n} className="process-step">
              <img src={step.img} alt="" aria-hidden="true" loading="lazy" decoding="async" />
              <div className="process-text">
                <span className="process-num">{step.n}</span>
                <div>
                  <h3>{t.home[step.t]}</h3>
                  <p>{t.home[step.d]}</p>
                </div>
              </div>
              {i < PROCESS.length - 1 && <span className="process-arrow" aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED PROJECTS ---------------- */}
      <section className="works reveal" data-header-surface="light" ref={worksRef}>
        <div className="works-head">
          <div>
            <span className="eyebrow">{t.home.worksEyebrow}</span>
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
        <div className="works-track" ref={worksTrackRef} role="region" aria-roledescription="carousel" aria-label={t.home.worksEyebrow}>
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
            <span className="eyebrow">{t.home.ctaEyebrow}</span>
            <h2>{t.home.ctaTitle}</h2>
            <p>{t.home.ctaDesc}</p>
          </div>
          <Link to="/contact" className="pill-btn">{t.home.ctaButton} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
