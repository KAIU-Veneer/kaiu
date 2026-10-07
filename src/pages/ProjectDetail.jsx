import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PhotoCycle, pillClass } from '../components/Shared.jsx';
import { PRODUCTS, PROJECTS } from '../data.js';
import { projectPhoto, IMAGE_SIZES } from '../imageSrc.js';
import { clampDescription, projectTitle, shortProductName } from '../siteMeta.js';
import useDocumentMeta from '../useDocumentMeta.js';
import { useLanguage } from '../LanguageContext.jsx';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const project = PROJECTS.find((p) => p.id === id);

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

  // A project can be finished in several veneers; each one links to its page.
  const veneers = (project.veneers || [])
    .map((productId) => PRODUCTS.find((product) => product.id === productId))
    .filter(Boolean);

  // Cells without a value are left out rather than shown empty. The third
  // item asks for a cell the full width of the grid, which a list of veneers
  // needs to read as one line rather than wrapping once per name.
  const rows = [
    [t.projectDetail.client, text('client')],
    [t.projectDetail.location, text('location')],
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
      veneers.length > 1,
    ],
    [t.projectDetail.designer, text('designer')],
  ].filter(([, value]) => value);

  return (
    <div className="project-detail page-section">
      <Link to="/projects" state={{ resume: true }} className="back-link">{t.projectDetail.back}</Link>
      <div className="project-detail-grid">
        <PhotoCycle images={project.images} alt={`${project.title}, ${room}`} className="project-detail-lead" sizes={IMAGE_SIZES.projectLead} />
        <div>
          <span className="eyebrow">{room}</span>
          <h1>{project.title}</h1>
          <p className="project-detail-desc">{text('longDesc')}</p>
          <div className="detail-info-grid">
            {rows.map(([label, value, wide]) => (
              <div key={label} className={`detail-info-cell${wide ? ' detail-info-cell-wide' : ''}`}>
                <span className="label">{label}</span>
                <span className="value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {project.images.length > 1 && (
        <div className="project-detail-gallery">
          {project.images.slice(1).map((img, i) => (
            <img
              key={img.src}
              {...projectPhoto(img.src)}
              sizes={IMAGE_SIZES.projectGallery}
              width={img.w}
              height={img.h}
              alt={`${project.title}, ${t.projectDetail.photo} ${i + 2}`}
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
}
