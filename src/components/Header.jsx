import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Component1 from './Component1.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';
import { useLanguage } from '../LanguageContext.jsx';
import './Header.css';

export default function Header() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const isActive = (prefix) => pathname === prefix || pathname.startsWith(prefix + '/');
  return (
    <header className="site-header">
      <Link to="/" className="logo-link" onClick={() => setOpen(false)}>
        <img src="/assets/logo/kaiu-logo-cropped.png" alt="KAIU" className="logo-img" />
      </Link>
      <nav className={open ? 'nav-open' : ''}>
        <button type="button" className="nav-close" aria-label="Close menu" onClick={() => setOpen(false)}>×</button>
        <Component1 to="/about" active={isActive('/about')} onClick={() => setOpen(false)}>{t.nav.about.toUpperCase()}</Component1>
        <Component1 to="/products" active={isActive('/products')} onClick={() => setOpen(false)}>{t.nav.products.toUpperCase()}</Component1>
        <Component1 to="/projects" active={isActive('/projects')} onClick={() => setOpen(false)}>{t.nav.projects.toUpperCase()}</Component1>
        <Component1 to="/services" active={isActive('/services')} onClick={() => setOpen(false)}>{t.nav.services.toUpperCase()}</Component1>
        <Component1 to="/contact" active={isActive('/contact')} onClick={() => setOpen(false)}>{t.nav.contact.toUpperCase()}</Component1>
      </nav>
      <div className="header-actions">
        <LanguageSwitch />
        <button
          type="button"
          className={`nav-toggle${open ? ' is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
    </header>
  );
}
