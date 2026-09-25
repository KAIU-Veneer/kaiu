import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { pillClass } from '../components/Shared.jsx';
import ProductVisual from '../components/ProductVisual.jsx';
import { PRODUCTS, DEFAULT_DIMENSION } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import { webSheetUrl, fallBackTo } from '../hiRes.js';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="product-detail page-section" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--kaiu-brown-deep)' }}>{t.productDetail.notFound}</p>
        <Link to="/products" className={pillClass('outline')} style={{ marginTop: 20 }}>{t.productDetail.back}</Link>
      </div>
    );
  }

  const shortName = product.name.replace(new RegExp('^' + product.collectionLabel + '\\s+'), '');

  return (
    <div className="product-detail page-section">
      <Link to="/products" className="back-link">{t.productDetail.back}</Link>
      <div className="product-detail-grid">
        <div>
          <ProductVisual product={product} />
          <div className="product-detail-dimrow">
            <div>
              <span className="label">{t.productDetail.dimension}</span>
              <span className="value">{product.dimension || DEFAULT_DIMENSION}</span>
            </div>
            <a href={product.hiResImage || product.image} download className="download-hires-link">{t.productDetail.downloadHiRes}</a>
          </div>
          {product.hiResImage && (
            <img
              key={product.hiResImage}
              src={webSheetUrl(product.hiResImage)}
              onError={fallBackTo(product.hiResImage)}
              className="product-detail-hires"
              alt=""
              loading="lazy"
            />
          )}
        </div>
        <div>
          <span className="eyebrow">{product.collectionLabel} {t.productDetail.collection}</span>
          <h1>{shortName}</h1>
          <span className="product-detail-cut">{lang === 'id' ? product.idCut : product.cut}</span>
          <p className="product-detail-desc">{(lang === 'id' ? product.idLongDesc : product.longDesc).split(product.name).join(shortName)}</p>
          <button className={`${pillClass()} product-detail-cta`} onClick={() => navigate('/contact')}>{t.productDetail.requestSample}</button>
        </div>
      </div>
    </div>
  );
}
