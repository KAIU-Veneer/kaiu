import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhotoCycle, pillClass } from '../components/Shared.jsx';
import { PROJECTS } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import { projectPhoto, IMAGE_SIZES } from '../imageSrc.js';
import useReveal from '../useReveal.js';
import useDocumentMeta from '../useDocumentMeta.js';
import './Projects.css';

const PROJECT_TYPES = ['residential', 'commercial', 'hospitality'];

function projectType(project) {
  const room = project.room.toLowerCase();
  if (room.includes('residence')) return 'residential';
  if (room.includes('restaurant') || room.includes('hospitality')) return 'hospitality';
  return 'commercial';
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

function ProjectTile({ project, typeLabel, location }) {
  return (
    <Link to={`/projects/${project.id}`} className="projects-tile">
      <PhotoCycle
        images={project.images}
        alt={`${project.title}, ${typeLabel}`}
        className="projects-tile-image"
        sizes={IMAGE_SIZES.projectCard}
      />
      <div className="projects-tile-caption">
        <div className="projects-tile-copy">
          <span className="projects-tile-type">{typeLabel}</span>
          <h3>{project.title}</h3>
          <p>{location}</p>
        </div>
        <span className="projects-tile-arrow"><ArrowIcon /></span>
      </div>
    </Link>
  );
}

export default function Projects() {
  const { t, lang } = useLanguage();
  useDocumentMeta(t.meta.projects);
  const [activeType, setActiveType] = useState('all');
  const ctaRef = useReveal();
  const initialFeaturedIndex = Math.max(0, PROJECTS.findIndex((project) => project.id === 'teazzi'));
  const [featuredIndex, setFeaturedIndex] = useState(initialFeaturedIndex);
  const [heroPaused, setHeroPaused] = useState(false);
  const featured = PROJECTS[featuredIndex] || PROJECTS[0];
  const availableTypes = PROJECT_TYPES.filter((type) => PROJECTS.some((project) => projectType(project) === type));
  const types = ['all', ...availableTypes];
  const visibleProjects = PROJECTS.filter((project) => activeType === 'all' || projectType(project) === activeType);
  const projectLabel = (type) => t.projects.types[type];
  const featuredLocation = lang === 'id' ? featured.idLocation : featured.location;

  useEffect(() => {
    if (PROJECTS.length < 2 || heroPaused) return undefined;
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
          setFeaturedIndex((index) => (index + 1) % PROJECTS.length);
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
  }, [featuredIndex, heroPaused]);

  const scrollToProjects = (event) => {
    event.preventDefault();
    const target = document.getElementById('project-collection');
    if (!target) return;
    window.history.replaceState(window.history.state, '', '#project-collection');
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="projects-page">
      <section
        className="projects-hero"
        data-header-surface="colored"
        onFocusCapture={() => setHeroPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false);
        }}
      >
        {PROJECTS.map((project, index) => {
          const isActive = index === featuredIndex;
          const isNext = index === (featuredIndex + 1) % PROJECTS.length;
          if (!isActive && !isNext) return null;
          return (
            <img
              key={project.id}
              className={`projects-hero-backdrop${isActive ? ' is-active' : ''}`}
              {...projectPhoto(project.images[0].src)}
              sizes="100vw"
              width={project.images[0].w}
              height={project.images[0].h}
              alt=""
              fetchpriority={index === initialFeaturedIndex ? 'high' : 'low'}
              aria-hidden="true"
            />
          );
        })}
        <div className="projects-hero-wash" aria-hidden="true" />
        <div className="projects-hero-copy">
          <h1>{t.projects.title1}<br />{t.projects.title2}</h1>
          <p>{t.projects.intro}</p>
          <a href="#project-collection" onClick={scrollToProjects} className="text-cta">
            {t.projects.explore} <span aria-hidden="true">↓</span>
          </a>
        </div>
        <Link to={`/projects/${featured.id}`} className="projects-hero-caption" aria-label={`${t.projects.featured}: ${featured.title}`}>
          <span className="projects-hero-caption-copy">
            <span>{t.projects.featured}</span>
            <strong>{featured.title}</strong>
            <small>{featuredLocation}</small>
          </span>
          <span className="projects-hero-arrow"><ArrowIcon /></span>
        </Link>
      </section>

      <section id="project-collection" className="projects-listing" data-header-surface="light" aria-labelledby="projects-list-title">
        <div className="projects-listing-head">
          <div className="projects-listing-intro">
            <div>
              <h2 id="projects-list-title">{t.projects.collectionTitle}</h2>
            </div>
            <p>{t.projects.collectionIntro}</p>
          </div>
          <div className="projects-listing-controls">
            <div className="projects-filters" role="group" aria-label={t.projects.filterLabel}>
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={activeType === type ? 'is-active' : ''}
                  aria-pressed={activeType === type}
                  onClick={() => setActiveType(type)}
                >
                  {type === 'all' ? t.projects.all : projectLabel(type)}
                </button>
              ))}
            </div>
            <span className="projects-result-count" aria-live="polite">
              {visibleProjects.length} {t.projects.projectCount}
            </span>
          </div>
        </div>

        <div className="projects-showcase-grid">
          {visibleProjects.map((project) => (
            <ProjectTile
              key={project.id}
              project={project}
              typeLabel={projectLabel(projectType(project))}
              location={lang === 'id' ? project.idLocation : project.location}
            />
          ))}
        </div>
      </section>

      <section className="projects-cta on-dark reveal" data-header-surface="colored" ref={ctaRef}>
        <div>
          <span className="eyebrow">{t.projects.ctaEyebrow}</span>
          <h2>{t.projects.ctaTitle}</h2>
        </div>
        <Link to="/contact" className={pillClass()}>
          {t.projects.ctaButton}<span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
