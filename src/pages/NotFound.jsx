import React from 'react';
import { Link } from 'react-router-dom';
import { pillClass } from '../components/Shared.jsx';
import { useLanguage } from '../LanguageContext.jsx';
import useReveal from '../useReveal.js';
import './NotFound.css';

const STRIP_IMAGES = [
  '/assets/image/CANNES WASHED OAK.webp',
  '/assets/image/CANNES GOLDEN WALNUT.webp',
  '/assets/image/CANNES ECLIPSE.webp',
];

export default function NotFound() {
  const { t } = useLanguage();
  const copyRef = useReveal();

  return (
    <div className="notfound page-section">
      <div className="notfound-inner reveal" ref={copyRef}>
        <span className="notfound-code" aria-hidden="true">404</span>
        <span className="eyebrow">{t.notFound.eyebrow}</span>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.desc}</p>

        <div className="notfound-actions">
          <Link to="/" className={pillClass()}>{t.notFound.home}</Link>
          <Link to="/products" className={pillClass('outline')}>{t.notFound.products}</Link>
        </div>

        <div className="notfound-strip" aria-hidden="true">
          {STRIP_IMAGES.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </div>

        <Link to="/contact" className="notfound-quiet-link">{t.notFound.contact}</Link>
      </div>
    </div>
  );
}
