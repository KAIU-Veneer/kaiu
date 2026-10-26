import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import BrandLogo from './BrandLogo.jsx';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <BrandLogo />
          <p>{t.footer.tagline}</p>
          <div className="socials">
            <a href="https://www.instagram.com/kaiuveneer/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="/assets/icons/instagram.svg" alt="" /></a>
            <a href="https://wa.me/628131205377" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><img src="/assets/icons/whatsapp.svg" alt="" /></a>
          </div>
        </div>

        <div className="footer-col">
          <h5>{t.footer.explore}</h5>
          <Link to="/">{t.nav.home}</Link>
          <Link to="/products">{t.nav.products}</Link>
          <Link to="/projects">{t.nav.projects}</Link>
          <Link to="/about">{t.nav.about}</Link>
          <Link to="/contact">{t.nav.contact}</Link>
        </div>

        <div className="footer-col">
          <h5>{t.footer.services}</h5>
          <Link to="/services">{t.footer.serviceVeneer}</Link>
          <Link to="/services">{t.footer.servicePanel}</Link>
          <Link to="/services">{t.footer.serviceFinishing}</Link>
        </div>

        <div className="footer-col">
          <h5>{t.footer.studio}</h5>
          <p>
            Jalan Pluit Karang Sari Blok B7T<br />
            64 RT 001 / RW 12<br />
            Jakarta Utara 14450, Indonesia
          </p>
          <a href="mailto:kaiuveneer@gmail.com">kaiuveneer@gmail.com</a>
          <a href="tel:+628131205377">+62 813 1205 377</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} KAIU Veneer. {t.footer.rights}</span>
      </div>
    </footer>
  );
}
