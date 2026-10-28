import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCTS, PROJECTS } from "../data.js";
import { useLanguage } from "../LanguageContext.jsx";
import useReveal from "../useReveal.js";
import { cardSwatch, projectPhoto, IMAGE_SIZES } from "../imageSrc.js";
import useDocumentMeta from '../useDocumentMeta.js';
import "./Home.css";

const PROCESS = [
  { t: 'p1t', d: 'p1d', img: '/assets/image/process/veneer-samples.webp?v=3' },
  { t: 'p2t', d: 'p2d', img: '/assets/image/process/hot-press.webp?v=3', position: 'center 52%' },
  { t: 'p3t', d: 'p3d', img: '/assets/image/w800/OSLO CEMENT GREY OAK.webp?v=2' },
];
const WORKSHOP_VIDEO_ID = 'bKxNFn6eYJk';

// Seven real sheets from the range, light to dark, standing edge to edge.
// One is open at a time so its grain reads; the rest show as narrow strips.
const SHEET_IDS = [
  'cairo-light-pine',
  'cairo-vanilla-oak',
  'oslo-cement-grey-oak',
  'cannes-oak-burl',
  'athens-brown-walnut',
  'athens-java-smoked-oak',
  'berlin-black-oakwood',
];
const SHEETS = SHEET_IDS.map((id) => PRODUCTS.find((p) => p.id === id));

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
  const workshopRef = useRef(null);
  const [workshopStarted, setWorkshopStarted] = useState(false);
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

  useEffect(() => {
    const section = workshopRef.current;
    if (!section) return undefined;
    if (!('IntersectionObserver' in window)) {
      setWorkshopStarted(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setWorkshopStarted(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px 0px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const materialRef = useReveal();
  const [openSheet, setOpenSheet] = useState(3);
  const sheet = SHEETS[openSheet];
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
        </div>

        <figure className="material-sheets">
          <div className="sheet-row" role="group" aria-label={t.home.sheetsLabel}>
            {SHEETS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`sheet${index === openSheet ? ' is-open' : ''}`}
                aria-pressed={index === openSheet}
                aria-label={item.name}
                onClick={() => setOpenSheet(index)}
                onMouseEnter={() => setOpenSheet(index)}
                onFocus={() => setOpenSheet(index)}
              >
                <img
                  {...cardSwatch(item.image)}
                  sizes="(max-width: 900px) 45vw, 26vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
          <figcaption className="sheet-caption" aria-live="polite">
            <span className="sheet-collection">{t.productDetail.collectionOf.replace('{name}', sheet.collectionLabel)}</span>
            <Link to={`/products/${sheet.id}`}>{sheet.name.replace(`${sheet.collectionLabel} `, '')} <span aria-hidden="true">→</span></Link>
          </figcaption>
        </figure>

        <div className="material-points">
          <ul className="material-list">
            {[['m1t','m1d'], ['m2t','m2d'], ['m3t','m3d'], ['m4t','m4d']].map(([title, desc]) => (
              <li key={title}>
                <strong>{t.home[title]}</strong>
                <span>{t.home[desc]}</span>
              </li>
            ))}
          </ul>
          <Link to="/products" className="text-cta">{t.home.exploreCollection} <span aria-hidden="true">→</span></Link>
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

      {/* ---------------- WORKSHOP VIDEO ---------------- */}
      <section ref={workshopRef} className="workshop-video on-dark" data-header-surface="colored">
        <div className="workshop-video-copy">
          <h2><span>{t.home.videoTitleTop}</span><span>{t.home.videoTitleBottom}</span></h2>
          <p>{t.home.videoDesc}</p>
        </div>
        <div className="workshop-player">
          <img
            src={`https://i.ytimg.com/vi/${WORKSHOP_VIDEO_ID}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {workshopStarted && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${WORKSHOP_VIDEO_ID}?autoplay=1&mute=1&playsinline=1&controls=1&rel=0&loop=1&playlist=${WORKSHOP_VIDEO_ID}`}
              title={`${t.home.videoTitleTop} ${t.home.videoTitleBottom}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              allowFullScreen
            />
          )}
        </div>
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
