import React, { useEffect, useState } from 'react';
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
            <select id="tone-filter" value={tone} onChange={(event) => choose(setTone)(event.target.value)}>
              {['all', ...TONE_OPTIONS].map((option) => (
                <option key={option} value={option}>{t.products.tones[option]}</option>
              ))}
            </select>
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
