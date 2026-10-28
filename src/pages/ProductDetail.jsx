import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pillClass } from '../components/Shared.jsx';
import { roomViewUrls } from '../components/RoomViews.jsx';
import { PRODUCTS, DEFAULT_DIMENSION } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import { webSheetUrl, fallBackTo } from '../hiRes.js';
import { cardSwatch, visualSwatch, IMAGE_SIZES } from '../imageSrc.js';
import { clampDescription, productTitle } from '../siteMeta.js';
import useDocumentMeta from '../useDocumentMeta.js';
import './ProductDetail.css';

const RELATED_COUNT = 5;

/** '2500 x 620 x 0.4mm' -> '2500 × 620 × 0.4mm' */
const prettySize = (dimension) => dimension.replace(/\s*x\s*/gi, ' × ');

/** Indonesian copy falls back to English where a veneer has no translation yet. */
const pickLang = (product, field, lang) => {
  const idField = 'id' + field[0].toUpperCase() + field.slice(1);
  const value = (lang === 'id' && product[idField]) || product[field];
  return value ? value[0].toUpperCase() + value.slice(1) : null;
};

/**
 * The veneer sheet first, then up to three renders of it in the room. The
 * thumbnails pick which one fills the frame; the frame crossfades between them.
 */
function Gallery({ product }) {
  const { t } = useLanguage();
  const rooms = roomViewUrls(product).slice(0, 3);
  const [active, setActive] = useState(0);
  const slides = [
    { key: 'sheet', label: t.productDetail.swatchThumb, main: visualSwatch(product.image), thumb: cardSwatch(product.image) },
    ...rooms.map((src, i) => ({
      key: src,
      label: t.productDetail.roomThumb.replace('{n}', i + 1),
      main: { src },
      thumb: { src },
    })),
  ];

  return (
    <div className={`pd-gallery${slides.length > 1 ? '' : ' is-single'}`}>
      <div className="pd-gallery-frame">
        {slides.map((slide, i) => (
          <img
            key={slide.key}
            {...slide.main}
            sizes={IMAGE_SIZES.productVisual}
            className={`pd-gallery-img${i === active ? ' is-active' : ''}`}
            alt={i === active ? `${product.name}, ${slide.label.toLowerCase()}` : ''}
            aria-hidden={i === active ? undefined : 'true'}
            decoding="async"
          />
        ))}
      </div>
      {slides.length > 1 && (
        <ul className="pd-gallery-thumbs" aria-label={t.productDetail.gallery}>
          {slides.map((slide, i) => (
            <li key={slide.key}>
              <button
                type="button"
                className="pd-thumb"
                aria-label={slide.label}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <img {...slide.thumb} sizes="96px" alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const product = PRODUCTS.find((p) => p.id === id);

  // A veneer describes itself better than any template could, so the search
  // result quotes the opening of its own description.
  useDocumentMeta(
    product
      ? {
          title: productTitle(product, lang),
          description: clampDescription(lang === 'id' ? product.idLongDesc : product.longDesc),
        }
      : { title: t.productDetail.notFound, noindex: true }
  );

  if (!product) {
    return (
      <div className="product-detail page-section" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--kaiu-brown-deep)' }}>{t.productDetail.notFound}</p>
        <Link to="/products" className={pillClass('outline')} style={{ marginTop: 20 }}>{t.productDetail.back}</Link>
      </div>
    );
  }

  const pd = t.productDetail;
  const shortName = product.name.replace(new RegExp('^' + product.collectionLabel + '\\s+'), '');
  const size = prettySize(product.dimension || DEFAULT_DIMENSION);

  // Some veneers are carried in more than one collection and share a single
  // sheet on disk, so the file is named after whichever collection shot it.
  // Naming the download after the product is what the visitor expects to find
  // in their downloads folder.
  const sheet = product.hiResImage || product.image;
  const sheetPath = sheet.split('?')[0];
  const downloadName = product.name.toUpperCase() + sheetPath.slice(sheetPath.lastIndexOf('.'));

  const specs = [
    [pd.specCollection, pd.collectionOf.replace('{name}', product.collectionLabel)],
    [pd.specSize, size],
    [pd.specFinish, pickLang(product, 'finish', lang)],
    [pd.specBestFor, pickLang(product, 'bestFor', lang)],
  ].filter(([, value]) => value);

  // The veneers that follow this one in its collection, wrapping round, so
  // every page shows a different handful rather than the same first five.
  const siblings = PRODUCTS.filter((p) => p.collection === product.collection);
  const at = siblings.indexOf(product);
  const related = siblings
    .slice(at + 1)
    .concat(siblings.slice(0, at))
    .slice(0, RELATED_COUNT);

  return (
    <div className="product-detail page-section">
      <nav className="pd-crumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">{pd.home}</Link></li>
          <li><Link to="/products" state={{ resume: true }}>{pd.collections}</Link></li>
          <li aria-current="page">{shortName}</li>
        </ol>
      </nav>

      <div className="pd-top">
        <Gallery key={product.id} product={product} />

        <div className="pd-info">
          <span className="pd-eyebrow">{pd.collectionOf.replace('{name}', product.collectionLabel)}</span>
          <h1>{shortName}</h1>
          <p className="pd-desc">{(lang === 'id' ? product.idLongDesc : product.longDesc).split(product.name).join(shortName)}</p>

          <dl className="pd-specs">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="pd-actions">
            <Link to="/contact" className={pillClass()}>{pd.requestSample}</Link>
            <a href={sheet} download={downloadName} className={pillClass('outline')}>{pd.downloadHiRes}</a>
          </div>
        </div>
      </div>

      {product.hiResImage && (
        <section className="pd-sheet" aria-labelledby="pd-sheet-title">
          <div className="pd-sheet-head">
            <div>
              <h2 id="pd-sheet-title">{pd.fullSheetTitle}</h2>
              <p>{pd.fullSheetNote.replace('{size}', size)}</p>
            </div>
            <a href={sheet} download={downloadName} className="download-hires-link">{pd.downloadHiRes}</a>
          </div>
          {/* On a phone the leaf keeps a readable height and pans sideways. */}
          <div className="pd-sheet-frame" tabIndex={0} role="region" aria-labelledby="pd-sheet-title">
            <img
              key={product.hiResImage}
              src={webSheetUrl(product.hiResImage)}
              onError={fallBackTo(product.hiResImage)}
              className="pd-sheet-img"
              alt={`${product.name}, ${pd.swatchThumb.toLowerCase()}`}
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="pd-related" aria-labelledby="pd-related-title">
          <h2 id="pd-related-title">{pd.relatedTitle.replace('{name}', pd.collectionOf.replace('{name}', product.collectionLabel))}</h2>
          <ul className="pd-related-row">
            {related.map((item) => (
              <li key={item.id}>
                <Link to={`/products/${item.id}`} className="pd-related-card">
                  <img {...cardSwatch(item.image)} sizes="(max-width: 900px) 42vw, 18vw" alt="" loading="lazy" decoding="async" />
                  <span>{item.name.replace(new RegExp('^' + item.collectionLabel + '\\s+'), '')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
