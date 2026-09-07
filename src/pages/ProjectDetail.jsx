import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { pillClass } from '../components/Shared.jsx';
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

  const rows = [
    [t.projectDetail.location, 'Jakarta, Indonesia'],
    [t.projectDetail.veneerUsed, lang === 'id' ? project.idVeneerUsed : project.veneerUsed],
    [t.projectDetail.scope, lang === 'id' ? project.idScope : project.scope],
    [t.projectDetail.finish, lang === 'id' ? project.idFinish : project.finish],
  ];

  return (
    <div className="project-detail page-section">
      <Link to="/projects" className="back-link">{t.projectDetail.back}</Link>
      <div className="project-detail-banner">
        <img src={project.image} className="scene" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt={lang === 'id' ? project.idRoom : project.room} />
      </div>
      <div className="project-detail-grid">
        <div>
          <span className="eyebrow">{t.projectDetail.hotel}</span>
          <h1>{lang === 'id' ? project.idRoom : project.room}</h1>
          <p className="project-detail-desc">{lang === 'id' ? project.idLongDesc : project.longDesc}</p>
        </div>
        <div className="detail-info-grid">
          {rows.map(([label, val]) => (
            <div key={label} className="detail-info-cell">
              <span className="label">{label}</span>
              <span className="value">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
