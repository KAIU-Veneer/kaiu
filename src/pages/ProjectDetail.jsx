import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { pillClass } from '../components/Shared.jsx';
import { PRODUCTS, PROJECTS } from '../data.js';
import { cardSwatch, projectPhoto, IMAGE_SIZES } from '../imageSrc.js';
import { clampDescription, projectTitle, shortProductName } from '../siteMeta.js';
import useDocumentMeta from '../useDocumentMeta.js';
import useReveal from '../useReveal.js';
import { useLanguage } from '../LanguageContext.jsx';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const project = PROJECTS.find((p) => p.id === id);
  const briefRef = useReveal();
  const galleryRef = useReveal();
  const paletteRef = useReveal();
  const moreRef = useReveal();

  useDocumentMeta(
    project
      ? {
          title: projectTitle(project),
          description: clampDescription(lang === 'id' ? project.idLongDesc : project.longDesc),
        }
      : { title: t.projectDetail.notFound, noindex: true }
  );

  if (!project) {
    return (
      <div className="project-detail page-section" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--kaiu-brown-deep)' }}>{t.projectDetail.notFound}</p>
        <Link to="/projects" className={pillClass('outline')} style={{ marginTop: 20 }}>{t.projectDetail.back}</Link>
      </div>
    );
  }

  // Indonesian copy lives on the same record under an `id`-prefixed key.
  const text = (key) => (lang === 'id' ? project[`id${key[0].toUpperCase()}${key.slice(1)}`] : project[key]);
  const room = text('room');
  const location = text('location');
  const designer = text('designer');

  // A project can be finished in several veneers; each one links to its page.
  const veneers = (project.veneers || [])
    .map((productId) => PRODUCTS.find((product) => product.id === productId))
    .filter(Boolean);

  // Cells without a value are left out rather than shown empty.
  const rows = [
    [t.projectDetail.space, room],
    [t.projectDetail.client, text('client')],
    [t.projectDetail.location, location],
    [
      veneers.length > 1 ? t.projectDetail.veneersUsed : t.projectDetail.veneerUsed,
      veneers.length
        ? veneers.map((product, i) => (
            <React.Fragment key={product.id}>
              {i > 0 && ', '}
              <Link to={`/products/${product.id}`}>{shortProductName(product)}</Link>
            </React.Fragment>
          ))
        : null,
    ],
    [t.projectDetail.designer, designer],
  ].filter(([, value]) => value);

  const lead = project.images[0];
  const rest = project.images.slice(1);
  const others = PROJECTS.filter((other) => other.id !== project.id).slice(0, 3);

  return (
    <div className="project-detail">
      {/* ---------------- HERO ---------------- */}
      <section className="project-hero" data-header-surface="colored">
        <img
          {...projectPhoto(lead.src)}
          sizes="100vw"
          width={lead.w}
          height={lead.h}
          className="project-hero-img"
          alt=""
          aria-hidden="true"
          fetchpriority="high"
        />
        <div className="project-hero-scrim" aria-hidden="true" />
        <div className="project-hero-copy">
          <div className="project-hero-head">
            <p className="project-hero-meta">{[room, location].filter(Boolean).join(' · ')}</p>
            <h1>{project.title}</h1>
          </div>
          {designer && (
            <p className="project-hero-designer">
              <span>{t.projectDetail.designer}</span>
              <strong>{designer}</strong>
            </p>
          )}
        </div>
      </section>

      {/* ---------------- THE BRIEF + PROJECT FILE ---------------- */}
      <section className="project-brief reveal" ref={briefRef}>
        <div className="project-brief-copy">
          <Link to="/projects" state={{ resume: true }} className="back-link">{t.projectDetail.back}</Link>
          <p>{text('longDesc')}</p>
        </div>
        <aside className="project-file">
          <dl className="project-file-table">
            {rows.map(([label, value]) => (
              <div key={label} className="project-file-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <Link to="/contact" className={pillClass()}>
            {t.projectDetail.requestPalette} <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </section>

      {/* ---------------- AS BUILT ---------------- */}
      {rest.length > 0 && (
        <section className="project-gallery-section reveal" ref={galleryRef}>
          <h2>{t.projectDetail.gallery}</h2>
          <div className="project-detail-gallery">
            {rest.map((img, i) => (
              <img
                key={img.src}
                {...projectPhoto(img.src)}
                sizes={IMAGE_SIZES.projectGallery}
                width={img.w}
                height={img.h}
                alt={`${project.title}, ${t.projectDetail.photo} ${i + 2}`}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- THE PALETTE ---------------- */}
      {veneers.length > 0 && (
        <section className="project-palette on-dark reveal" data-header-surface="colored" ref={paletteRef}>
          <div className="project-palette-head">
            <h2>{t.projectDetail.paletteTitle}</h2>
            <Link to="/products" className="text-cta">
              {t.nav.products} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="project-palette-grid" style={{ '--palette-count': veneers.length }}>
            {veneers.map((product) => (
              <li key={product.id}>
                <Link to={`/products/${product.id}`}>
                  <span className="project-palette-swatch">
                    <img
                      {...cardSwatch(product.image)}
                      sizes={IMAGE_SIZES.cardSwatch}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="project-palette-name">{shortProductName(product)}</span>
                  <span className="project-palette-collection">{product.collectionLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="project-palette-note">{t.projectDetail.paletteNote}</p>
        </section>
      )}

      {/* ---------------- MORE PROJECTS ---------------- */}
      {others.length > 0 && (
        <section className="project-more reveal" ref={moreRef}>
          <div className="project-more-head">
            <h2>{t.projectDetail.moreTitle}</h2>
            <Link to="/projects" className="text-cta">
              {t.projectDetail.allProjects} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="project-more-grid">
            {others.map((other) => (
              <Link key={other.id} to={`/projects/${other.id}`} className="project-more-card">
                <span className="project-more-image">
                  <img
                    {...projectPhoto(other.images[0].src)}
                    sizes={IMAGE_SIZES.projectCard}
                    width={other.images[0].w}
                    height={other.images[0].h}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="project-more-meta">
                  {[lang === 'id' ? other.idRoom : other.room, lang === 'id' ? other.idLocation : other.location]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className="project-more-title">{other.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- CTA ---------------- */}
      <section className="project-detail-cta on-dark" data-header-surface="colored">
        <div>
          <h2>{t.projectDetail.ctaTitle}</h2>
          <p>{t.projectDetail.ctaDesc}</p>
        </div>
        <Link to="/contact" className={pillClass()}>
          {t.projectDetail.ctaButton} <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
