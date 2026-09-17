import React, { lazy, Suspense, useState } from 'react';
import { useLanguage } from '../LanguageContext.jsx';
import { webSheetUrl } from '../hiRes.js';
import './ProductVisual.css';

// three.js and the room model only download when someone opens the 3D room.
const loadViewer = () => import('./room3d/RoomViewer3D.jsx');
const RoomViewer3D = lazy(loadViewer);
const warmViewer = () => loadViewer().then((m) => m.preloadRoomModel()).catch(() => {});

const CubeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Zm0 0v9m0 0 8-4.5M12 12l-8-4.5" /></svg>
);

/**
 * The product's swatch, and for products with a hi-res sheet, a button that
 * swaps it for the 3D room. Stays in 3D when moving between products that
 * have sheets, and falls back to the swatch for ones that don't.
 */
export default function ProductVisual({ product }) {
  const { t } = useLanguage();
  const [wants3d, setWants3d] = useState(false);
  const has3d = Boolean(product.hiResImage);

  if (wants3d && has3d) {
    return (
      <Suspense fallback={<div className="product-visual-loading" />}>
        <RoomViewer3D
          textureUrl={webSheetUrl(product.hiResImage)}
          fallbackUrl={product.hiResImage}
          label={product.name}
          swatchImage={product.image}
          onBackToSwatch={() => setWants3d(false)}
        />
      </Suspense>
    );
  }

  return (
    <div className="product-visual">
      <img src={product.image} className="product-visual-swatch" alt={product.name} loading="lazy" />
      {has3d && (
        <button
          type="button"
          className="product-visual-3d-btn"
          onClick={() => setWants3d(true)}
          onMouseEnter={warmViewer}
          onFocus={warmViewer}
          onTouchStart={warmViewer}
        >
          <CubeIcon />
          {t.viewer.open}
        </button>
      )}
    </div>
  );
}
