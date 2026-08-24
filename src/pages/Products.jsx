import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swatch, pillClass } from '../components/Shared.jsx';
import { PRODUCTS, FILTER_OPTIONS, COLLECTION_INFO, PAGE_SIZE, PAGE_SIZE_MORE } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import useReveal from '../useReveal.js';
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

export default function Products() {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const ctaRef = useReveal();
  const byCollection = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.collection === filter);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? byCollection.filter((p) =>
        [p.name, p.collectionLabel, p.cut, p.idCut, p.species, p.idSpecies]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    : byCollection;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const activeInfo = filter !== 'all' ? COLLECTION_INFO[filter] : null;

  return (
    <div>
      <div className="products-header">
        <span className="eyebrow">{t.products.eyebrow}</span>
        <h1>{t.products.title}</h1>
        <div className="filter-row">
          <div className="filters">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.id}
                className={filter === f.id ? 'active' : ''}
                onClick={() => { setFilter(f.id); setVisibleCount(PAGE_SIZE); }}
              >
                {lang === 'id' ? f.idLabel : f.label}
              </button>
            ))}
          </div>
          <div className={`product-search${searchOpen || query ? ' open' : ''}`}>
            <button
              type="button"
              className="product-search-toggle"
              onClick={() => setSearchOpen((o) => !o)}
              aria-label={lang === 'id' ? 'Cari veneer' : 'Search veneer'}
            >
              <svg className="product-search-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <line x1="15.4" y1="15.4" x2="20.5" y2="20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
              onBlur={() => { if (!query) setSearchOpen(false); }}
              placeholder={lang === 'id' ? 'Cari veneer…' : 'Search veneer…'}
              aria-label={lang === 'id' ? 'Cari veneer' : 'Search veneer'}
              autoFocus={searchOpen}
              tabIndex={searchOpen || query ? 0 : -1}
            />
          </div>
        </div>
      </div>

      {activeInfo && (
        <div className="collection-banner">
          <span className="collection-banner-rule" />
          <h2>{filter.toUpperCase()}</h2>
          <p>{lang === 'id' ? activeInfo.idTagline : activeInfo.tagline}</p>
        </div>
      )}

      <div className="products-body">
        <div className="product-grid">
          {visible.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="product-card">
              <img src={p.image} className="swatch" loading="lazy"/>
              <h4>{displayName(p.name, p.collectionLabel)}</h4>
              <span className="product-collection-label">{t.productDetail.collection}: {p.collectionLabel.toUpperCase()}</span>
              <span className="product-short-desc">{shortDesc(lang === 'id' ? p.idLongDesc : p.longDesc)}</span>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="products-empty">
            {lang === 'id'
              ? 'Tidak ada veneer yang cocok dengan pencarian Anda.'
              : 'No veneer matches your search.'}
          </p>
        )}
        {hasMore && (
          <div className="show-more">
            <button className={pillClass('outline')} onClick={() => setVisibleCount((c) => c + PAGE_SIZE_MORE)}>{t.products.showMore}</button>
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
