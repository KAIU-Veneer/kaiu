import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import useDocumentMeta from '../useDocumentMeta.js';
import WorkshopVideo from '../components/WorkshopVideo.jsx';
import './Services.css';

// Kept plain: the heading and the three services as text in one column,
// beside a photograph of fifteen sample sheets laid out in rows.
export default function Services() {
  const { t, lang } = useLanguage();
  useDocumentMeta(t.meta.services);

  return (
    <div className="services-page">
      <section className="services-intro">
        <header className="services-head">
          <h1>{t.services.title}</h1>
          <p>{t.services.intro}</p>
        </header>
        <div className="services-photo">
          <img
            src="/assets/image/process/veneer-sample-grid.webp"
            alt=""
            width="1448"
            height="1086"
            decoding="async"
          />
        </div>
        <ol className="services-list">
          {SERVICES.map((s, i) => (
            <li key={s.title}>
              <h2>{lang === 'id' ? s.idTitle : s.title}</h2>
              <p>{(lang === 'id' ? s.idDesc : s.desc).trim()}</p>
              {i === 0 && (
                <Link to="/products" className="text-cta">{t.home.exploreCollection} <span aria-hidden="true">→</span></Link>
              )}
            </li>
          ))}
        </ol>
      </section>

      <WorkshopVideo />

      <section className="services-cta">
        <div>
          <h2>{t.home.ctaTitle}</h2>
          <p>{t.home.ctaDesc}</p>
        </div>
        <Link to="/contact" className="pill-btn">{t.home.ctaButton} <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
