import React from 'react';
import { Link } from 'react-router-dom';
import { pillClass } from '../components/Shared.jsx';
import { SERVICES } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import useReveal from '../useReveal.js';
import './Services.css';

export default function Services() {
  const { t, lang } = useLanguage();
  const listRef = useReveal();
  const ctaRef = useReveal();
  return (
    <div>
      <div className="services-body page-section">
        <span className="eyebrow">{t.services.eyebrow}</span>
        <h1>{t.services.title}</h1>
        <div className="service-list reveal" ref={listRef}>
          {SERVICES.map((s) => (
            <div key={s.num} className="service-row">
              <div className="num">{s.num}</div>
              <h3>{lang === 'id' ? s.idTitle : s.title}</h3>
              <p>{lang === 'id' ? s.idDesc : s.desc}</p>
            </div>
          ))}
          <div className="service-list-end" />
        </div>
      </div>
      {/* <section className="section-alt reveal" ref={ctaRef}>
        <span className="eyebrow">Ready to begin?</span>
        <h2>Tell us about your project.</h2>
        <Link to="/contact" className={pillClass()} style={{ marginTop: 26 }}>Contact Us</Link>
      </section> */}
    </div>
  );
}
