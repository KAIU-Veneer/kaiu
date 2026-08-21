import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Swatch, pillClass } from '../components/Shared.jsx';
import RoomGallery from '../components/RoomGallery.jsx';
import { PRODUCTS } from '../data.js';
import { useLanguage } from '../LanguageContext.jsx';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const product = PRODUCTS.find((p) => p.id === id);
  const [showRoom, setShowRoom] = useState(false);
  const hasRooms = product && product.roomImages && product.roomImages.length > 0;

  if (!product) {
    return (
      <div className="product-detail" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--kaiu-brown-deep)' }}>{t.productDetail.notFound}</p>
        <Link to="/products" className={pillClass('outline')} style={{ marginTop: 20 }}>{t.productDetail.back}</Link>
      </div>
    );
  }

  const shortName = product.name.replace(new RegExp('^' + product.collectionLabel + '\\s+'), '');
  const rows = [
    [t.productDetail.species, lang === 'id' ? product.idSpecies : product.species],
    [t.productDetail.cutMethod, lang === 'id' ? product.idCutMethod : product.cutMethod],
    [t.productDetail.bestFor, lang === 'id' ? product.idBestFor : product.bestFor],
    [t.productDetail.finish, lang === 'id' ? product.idFinish : product.finish],
  ];

  return (
    <div className="product-detail">
      <Link to="/products" className="back-link">{t.productDetail.back}</Link>
      <div className="product-detail-grid">
        <div>
          {showRoom ? (
            <RoomGallery images={product.roomImages} label={product.name} swatchImage={product.image} onBackToSwatch={() => setShowRoom(false)} />
          ) : (
            <div style={{ position: 'relative' }}>
              <img src={product.image} className="product-detail-swatch" loading="lazy"/>
              {hasRooms && (
                <button
                  onClick={() => setShowRoom(true)}
                  aria-label="View in room"
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 40, height: 40, borderRadius: '50%', border: 'none',
                    background: 'rgba(255,255,255,0.85)', color: '#332824', fontSize: 18,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ›
                </button>
              )}
            </div>
          )}
        </div>
        <div>
          <span className="eyebrow">{product.collectionLabel} {t.productDetail.collection}</span>
          <h1>{shortName}</h1>
          <span className="product-detail-cut">{lang === 'id' ? product.idCut : product.cut}</span>
          <p className="product-detail-desc">{(lang === 'id' ? product.idLongDesc : product.longDesc).split(product.name).join(shortName)}</p>
          <div className="detail-info-grid">
            {rows.map(([label, val]) => (
              <div key={label} className="detail-info-cell">
                <span className="label">{label}</span>
                <span className="value">{val}</span>
              </div>
            ))}
          </div>
          <button className={`${pillClass()} product-detail-cta`} onClick={() => navigate('/contact')}>{t.productDetail.requestSample}</button>
        </div>
      </div>
    </div>
  );
}
