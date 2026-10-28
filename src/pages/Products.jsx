import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigationType } from 'react-router-dom';
import { PRODUCTS, FILTER_OPTIONS, COLLECTION_INFO, DEFAULT_DIMENSION } from '../data.js';
import { cardSwatch, IMAGE_SIZES } from '../imageSrc.js';
import { useLanguage } from '../LanguageContext.jsx';
import useDocumentMeta from '../useDocumentMeta.js';
import './Products.css';

function shortDesc(text) {
  if (!text) return '';
  const firstSentence = text.split(/(?<=[.!?])\s/)[0];
  return firstSentence;
}

function displayName(name, collectionLabel) {
  const prefix = collectionLabel + ' ';
  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
}

const TONE_OPTIONS = ['light', 'warm', 'cool', 'dark', 'colorful'];
const TONE_TERMS = {
  light: /\b(light|pale|paler|ivory|white|cream|blonde|bleached|alabaster|snow|sand|linen|chalk|pearl|champagne|natural white|wheat|beige)\b/i,
  warm: /\b(warm|brown|walnut|honey|amber|caramel|russet|cinnamon|mocha|latte|cocoa|espresso|coffee|golden|gold|chestnut|cognac|terracotta|clay|copper|tawny|tan|sienna|oak burl)\b/i,
  cool: /\b(cool|grey|gray|silver|ash|slate|blue|indigo|cobalt|mist|steel|smoke|graphite|cement|pewter|frost|ice|jade|teal)\b/i,
  dark: /\b(dark|deep|black|ebony|charcoal|midnight|noir|raven|burnt|smoked|carbon|shadow|onyx|espresso)\b/i,
  colorful: /\b(colorful|multi.colou?r|vibrant|color pop|mosaic|crimson|sangria|amethyst|domino|cloisonne|terraz?zo|starry|jade|flower|chenille|weave|stripes|tiles|contour|pattern)\b/i,
};

function productTones(product) {
  const text = `${product.name} ${product.longDesc || ''}`;
  const matches = TONE_OPTIONS.filter((tone) => TONE_TERMS[tone].test(text));
  // Wood designs without a strong color cue read as warm, natural tones.
  return matches.length ? matches : ['warm'];
}

function ToneSelect({ options, value, onChange, label }) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const typeaheadRef = useRef('');
  const typeaheadTimerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => options.findIndex(([key]) => key === value));
  const [position, setPosition] = useState(null);
  const selectedIndex = Math.max(0, options.findIndex(([key]) => key === value));
  const menuId = 'tone-filter-options';

  const showMenu = (index = selectedIndex) => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(Math.max(rect.width, 176), window.innerWidth - 24);
    const height = Math.min(options.length * 40 + 12, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= height + 12
      ? rect.bottom + 8
      : Math.max(12, rect.top - height - 8);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    setPosition({ top, left, width });
    setActiveIndex(index);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnScroll = () => setOpen(false);
    document.addEventListener('pointerdown', closeOnOutside);
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnScroll);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(typeaheadTimerRef.current), []);

  const onTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) showMenu(selectedIndex);
      else setActiveIndex((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      onChange(options[activeIndex][0]);
      setOpen(false);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeaheadRef.current += event.key.toLowerCase();
      window.clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = window.setTimeout(() => { typeaheadRef.current = ''; }, 700);
      const match = options.findIndex(([, text]) => text.toLowerCase().startsWith(typeaheadRef.current));
      if (match >= 0) {
        if (!open) showMenu(match);
        else setActiveIndex(match);
      }
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id="tone-filter"
        type="button"
        className={`tone-select-trigger${open ? ' is-open' : ''}`}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-valuetext={options[selectedIndex][1]}
        aria-activedescendant={open ? `${menuId}-${options[activeIndex][0]}` : undefined}
        onClick={() => (open ? setOpen(false) : showMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{options[selectedIndex][1]}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 6 4.5 4 4.5-4" /></svg>
      </button>
      {open && position && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          className="tone-select-menu"
          role="listbox"
          aria-label={label}
          style={position}
        >
          {options.map(([key, text], index) => (
            <div
              key={key}
              id={`${menuId}-${key}`}
              className={`tone-select-option${key === value ? ' is-selected' : ''}${index === activeIndex ? ' is-active' : ''}`}
              role="option"
              aria-selected={key === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                onChange(key);
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              {text}
              {key === value && <span aria-hidden="true">✓</span>}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

/**
 * What the visitor had on screen the last time they were here. Opening a
 * veneer and coming back unmounts this page. A step back in history resumes
 * the visitor's collection, tone and search choices, as does the back link on a
 * veneer's own page; arriving from the menu or a fresh link starts clean.
 */
const lastView = { filter: 'all', tone: 'all', query: '', shown: 0 };

// Cards render in batches so the first view stays light; the rest follow on request.
const BATCH = 40;

export default function Products() {
  const { t, lang } = useLanguage();
  useDocumentMeta(t.meta.products);
  const { state } = useLocation();
  const resuming = useNavigationType() === 'POP' || Boolean(state && state.resume);
  const [filter, setFilter] = useState(resuming ? lastView.filter : 'all');
  const [tone, setTone] = useState(resuming ? lastView.tone : 'all');
  const [query, setQuery] = useState(resuming ? lastView.query : '');
  const [shown, setShown] = useState(resuming ? Math.max(lastView.shown, BATCH) : BATCH);

  useEffect(() => {
    Object.assign(lastView, { filter, tone, query, shown });
  }, [filter, tone, query, shown]);

  // A new filter or search starts again from the first batch.
  const choose = (setter) => (value) => {
    setter(value);
    setShown(BATCH);
  };
  const resetFilters = () => {
    setFilter('all');
    setTone('all');
    setQuery('');
    setShown(BATCH);
  };

  const byCollection = PRODUCTS.filter((p) =>
    (filter === 'all' || p.collection === filter) &&
    (tone === 'all' || productTones(p).includes(tone))
  );
  const q = query.trim().toLowerCase();
  const filtered = q
    ? byCollection.filter((p) =>
        [p.name, p.collectionLabel, p.cut, p.idCut, p.species, p.idSpecies]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    : byCollection;
  const activeInfo = filter !== 'all' ? COLLECTION_INFO[filter] : null;

  return (
    <div>
      <div className="products-header page-section-head">
        <span className="eyebrow">{t.products.eyebrow}</span>
        <h1>{t.products.title}</h1>
        <div className="filter-row">
          <div className="filters">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.id}
                className={filter === f.id ? 'active' : ''}
                onClick={() => choose(setFilter)(f.id)}
              >
                {lang === 'id' ? f.idLabel : f.label}
              </button>
            ))}
          </div>
          <div className="tone-filter">
            <label className="tone-filter-label" htmlFor="tone-filter">{t.products.toneLabel}</label>
            <ToneSelect
              options={['all', ...TONE_OPTIONS].map((option) => [option, t.products.tones[option]])}
              value={tone}
              onChange={choose(setTone)}
              label={t.products.toneLabel}
            />
          </div>
          {/* The field is always open: hiding search behind a toggle costs a
              click on the one page where people arrive knowing what they want. */}
          <div className="product-search">
            <label className="product-search-label" htmlFor="product-search">{t.products.searchLabel}</label>
            <div className="product-search-field">
              <svg className="product-search-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <line x1="15.4" y1="15.4" x2="20.5" y2="20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                id="product-search"
                type="search"
                value={query}
                onChange={(e) => choose(setQuery)(e.target.value)}
                placeholder={t.products.searchPlaceholder}
              />
            </div>
          </div>
          <span className="product-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? t.products.resultOne : t.products.resultMany}
          </span>
        </div>
      </div>

      {activeInfo && (
        <div className="collection-banner">
          <span className="collection-banner-rule" />
          <h2>{filter.toUpperCase()}</h2>
          <p>{lang === 'id' ? activeInfo.idTagline : activeInfo.tagline}</p>
        </div>
      )}

      <div className="products-body page-section-body">
        <div className="product-grid">
          {filtered.slice(0, shown).map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="product-card">
              <img {...cardSwatch(p.image)} sizes={IMAGE_SIZES.cardSwatch}
                   className="swatch" alt={p.name} loading="lazy" decoding="async" />
              <h2 className="product-card-name">{displayName(p.name, p.collectionLabel)}</h2>
              <span className="product-collection-label">{p.collectionLabel.toUpperCase()} · {(p.dimension || DEFAULT_DIMENSION).split(' x ').slice(0, 2).join(' × ')}</span>
              <span className="product-short-desc">{shortDesc(lang === 'id' ? p.idLongDesc : p.longDesc)}</span>
            </Link>
          ))}
        </div>
        {filtered.length > shown && (
          <div className="products-more">
            <button type="button" className="pill-btn pill-btn-outline" onClick={() => setShown((n) => n + BATCH)}>
              {t.products.showMore}
            </button>
            <span>{shown} / {filtered.length}</span>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="products-empty">
            <p>{t.products.empty}</p>
            <button type="button" className="pill-btn pill-btn-outline" onClick={resetFilters}>{t.products.reset}</button>
          </div>
        )}
      </div>

      {/* <section className="section-alt reveal" ref={ctaRef}>
        <span className="eyebrow">Need a custom match?</span>
        <h2>We can source and cut veneer to your exact specification.</h2>
        <Link to="/contact" className={pillClass()} style={{ marginTop: 26 }}>Request a Sample</Link>
      </section> */}
    </div>
  );
}
