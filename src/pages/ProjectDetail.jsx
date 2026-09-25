import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PhotoCycle, pillClass } from '../components/Shared.jsx';
import { PROJECTS } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const project = PROJECTS.find((p) => p.id === id);

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
  const veneer = text('veneerUsed');

  // Cells without a value are left out rather than shown empty.
  const rows = [
    [t.projectDetail.client, text('client')],
    [t.projectDetail.location, text('location')],
    [
      t.projectDetail.veneerUsed,
      project.productId ? <Link to={`/products/${project.productId}`}>{veneer}</Link> : veneer,
    ],
    [t.projectDetail.designer, text('designer')],
  ].filter(([, value]) => value);

  return (
    <div className="project-detail page-section">
      <Link to="/projects" className="back-link">{t.projectDetail.back}</Link>
      <div className="project-detail-grid">
        <PhotoCycle images={project.images} alt={`${project.title}, ${room}`} className="project-detail-lead" />
        <div>
          <span className="eyebrow">{room}</span>
          <h1>{project.title}</h1>
          <p className="project-detail-desc">{text('longDesc')}</p>
          <div className="detail-info-grid">
            {rows.map(([label, value]) => (
              <div key={label} className="detail-info-cell">
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
              src={img.src}
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
