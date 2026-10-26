import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Component1 from './Component1.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';
import BrandLogo from './BrandLogo.jsx';
import { useLanguage } from '../LanguageContext.jsx';
import './Header.css';

export default function Header() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [transparent, setTransparent] = useState(false);
  const isHome = pathname === '/';
  const isActive = (prefix) => pathname === prefix || pathname.startsWith(prefix + '/');
  const close = () => setOpen(false);
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  // While the drawer is open, Escape closes it, Tab stays inside it and the
  // page behind it stops scrolling. Focus goes back to the toggle on close.
  useEffect(() => {
    if (!open) return undefined;
    const nav = navRef.current;
    const toggle = toggleRef.current;
    const focusables = () => [...nav.querySelectorAll('a, button')];
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('nav-is-open');
    focusables()[0]?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      document.body.classList.remove('nav-is-open');
      toggle?.focus();
    };
  }, [open]);

  useLayoutEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return undefined;

    const update = () => {
      const y = Math.min(window.innerHeight - 1, Math.ceil(header.getBoundingClientRect().bottom + 1));
      const point = document.elementFromPoint(Math.floor(window.innerWidth / 2), y);
      const section = point?.closest('[data-header-surface], section, .page-section, .page-section-head, .page-section-body, .site-footer');
      let shouldBeTransparent = false;

      if (section?.dataset.headerSurface) {
        shouldBeTransparent = section.dataset.headerSurface === 'colored';
      } else {
        // Judge the section container and its ancestors only. Images and cards
        // inside a light section must not change the header treatment.
        let surface = section;
        while (surface && surface !== document.body) {
          if (surface.classList.contains('on-dark')) {
            shouldBeTransparent = true;
            break;
          }

          const style = window.getComputedStyle(surface);
          if (style.backgroundImage !== 'none') {
            shouldBeTransparent = true;
            break;
          }

          const channels = style.backgroundColor.match(/[\d.]+/g)?.map(Number);
          if (channels && channels.length >= 3 && (channels[3] ?? 1) > 0.08) {
            const [red, green, blue] = channels;
            const brightness = red * 0.2126 + green * 0.7152 + blue * 0.0722;
            const neutral = Math.max(red, green, blue) - Math.min(red, green, blue) < 28;
            shouldBeTransparent = !(neutral && brightness >= 205);
            break;
          }
          surface = surface.parentElement;
        }
      }

      setTransparent(shouldBeTransparent);
    };

    let frame = 0;
    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [pathname]);

  return (
    <header className={`site-header${isHome ? ' home-header' : ''}${transparent ? ' is-transparent' : ''}${open ? ' menu-open' : ''}`}>
      <Link to="/" className="logo-link" onClick={close}>
        <BrandLogo />
      </Link>
      <nav className={open ? 'nav-open' : ''} ref={navRef} id="site-nav">
        <button type="button" className="nav-close" aria-label={t.a11y.closeMenu} onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <Component1 to="/" active={pathname === '/'} onClick={close}>{t.nav.home.toUpperCase()}</Component1>
        <Component1 to="/products" active={isActive('/products')} onClick={close}>{t.nav.products.toUpperCase()}</Component1>
        <Component1 to="/projects" active={isActive('/projects')} onClick={close}>{t.nav.projects.toUpperCase()}</Component1>
        <Component1 to="/about" active={isActive('/about')} onClick={close}>{t.nav.about.toUpperCase()}</Component1>
        <Component1 to="/services" active={isActive('/services')} onClick={close}>{t.nav.services.toUpperCase()}</Component1>
        <Component1 to="/contact" active={isActive('/contact')} onClick={close}>{t.nav.contact.toUpperCase()}</Component1>
        <Link to="/contact" className="nav-drawer-cta" onClick={close}>{t.nav.inquire}</Link>
      </nav>
      <div className="header-actions">
        <LanguageSwitch />
        <Link to="/contact" className="header-cta" onClick={close}>{t.nav.inquire}</Link>
        <button
          type="button"
          ref={toggleRef}
          className={`nav-toggle${open ? ' is-open' : ''}`}
          aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
      {open && <div className="nav-backdrop" onClick={close} />}
    </header>
  );
}
