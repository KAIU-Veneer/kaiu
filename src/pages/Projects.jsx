import React from 'react';
import { Link } from 'react-router-dom';
import { pillClass, ProjectCard } from '../components/Shared.jsx';
import { PROJECTS } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import useReveal from '../useReveal.js';
import './Projects.css';

export default function Projects() {
  const { t } = useLanguage();
  const ctaRef = useReveal();
  return (
    <div>
      <div className="projects-header page-section-head">
        <span className="eyebrow">{t.projects.eyebrow}</span>
        <h1>{t.projects.title}</h1>
      </div>
      <div className="projects-body page-section-body">
        <div className="project-grid">
          {PROJECTS.map((pr) => (
            <ProjectCard key={pr.id} project={pr} to={`/projects/${pr.id}`} />
          ))}
        </div>
      </div>
      {/* <section className="section-alt reveal" ref={ctaRef}>
        <span className="eyebrow">Have a space in mind?</span>
        <h2>Let's bring your project the same warmth.</h2>
        <Link to="/contact" className={pillClass()} style={{ marginTop: 26 }}>Start a Conversation</Link>
      </section> */}
    </div>
  );
}
