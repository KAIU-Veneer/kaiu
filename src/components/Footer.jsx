import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/assets/logo/kaiu-logo-cropped.png" alt="KAIU" className="footer-logo" />
          <p>{t.footer.tagline}</p>
        </div>
        <div className="footer-cols">
          <div>
            <h5>{t.footer.explore}</h5>
            <Link to="/about">{t.nav.about}</Link>
            <Link to="/products">{t.nav.products}</Link>
            <Link to="/projects">{t.nav.projects}</Link>
            <Link to="/services">{t.nav.services}</Link>
          </div>
          <div>
            <h5>{t.footer.studio}</h5>
            <p>Jl. Pluit Karang Sari VII<br />RT.1/RW.12, Pluit, Penjaringan<br /> <br/>North Jakarta, Indonesia</p>
            <a href="mailto:kaiuveneer@gmail.com">kaiuveneer@gmail.com</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} KAIU. {t.footer.rights}</span>
        <div className="socials">
          <a href="https://www.instagram.com/kaiuveneer/" aria-label="Instagram"><img src="/assets/icons/instagram.svg" alt="" /></a>
          <a href="https://wa.me/628131205377" aria-label="WhatsApp"><img src="/assets/icons/whatsapp.svg" alt="" /></a>
        </div>
      </div>
    </footer>
  );
}
