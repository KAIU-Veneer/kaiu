import React, { useState } from 'react';

// Card-style room display switcher: shows the veneer applied in a real room
// photo, with prev/next arrows to cycle through available angles/rooms.
export default function RoomGallery({ images, label, swatchImage, onBackToSwatch }) {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: 4, overflow: 'hidden', background: '#1a120c' }}>
      <img src={images[index]} alt={label || 'Room display'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

      {swatchImage && onBackToSwatch && (
        <button
          onClick={onBackToSwatch}
          aria-label="View veneer swatch"
          style={{
            position: 'absolute', left: 12, top: 12,
            width: 56, height: 56, borderRadius: 6, border: '2px solid #fff',
            padding: 0, overflow: 'hidden', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          <img src={swatchImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </button>
      )}
      {images.length > 1 && (
        <button
          onClick={prev}
          aria-label="Previous room view"
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.85)', color: '#332824', fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ‹
        </button>
      )}
      {images.length > 1 && (
        <button
          onClick={next}
          aria-label="Next room view"
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
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {images.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === index ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
