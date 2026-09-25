import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext.jsx';
import RoomViews, { hasRoomViews } from './RoomViews.jsx';
import './ProductVisual.css';

const RoomIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20V9l9-5 9 5v11M3 20h18M8 20v-6h8v6" /></svg>
);

/**
 * The product's swatch, and for veneers with rendered room images, a button
 * that swaps it for the room view. Stays on the room view when moving between
 * products that have one, and falls back to the swatch for ones that don't.
 */
export default function ProductVisual({ product }) {
  const { t } = useLanguage();
  const [wantsRoom, setWantsRoom] = useState(false);
  const hasRoom = hasRoomViews(product);

  if (wantsRoom && hasRoom) {
    return <RoomViews product={product} onBackToSwatch={() => setWantsRoom(false)} />;
  }

  return (
    <div className="product-visual">
      <img src={product.image} className="product-visual-swatch" alt={product.name} loading="lazy" />
      {hasRoom && (
        <button type="button" className="product-visual-room-btn" onClick={() => setWantsRoom(true)}>
          <RoomIcon />
          {t.viewer.open}
        </button>
      )}
    </div>
  );
}
