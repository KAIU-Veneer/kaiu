import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext.jsx';
import manifest from '../roomViews.json';
import { roomViewUrl, sheetName } from '../roomViewPaths.js';
import './RoomViews.css';

/** How many room views a veneer has, 0 if it has none. */
const viewCount = (name) => manifest.veneers[name] || 0;

/**
 * The folder of room images for a product, or null if it has none. Renders
 * are named after the veneer, which is normally the product's hi-res sheet;
 * a product with no sheet can still be matched by its own name.
 */
const veneerKey = (product) => {
  const sheet = product.hiResImage && sheetName(product.hiResImage);
  if (sheet && viewCount(sheet)) return sheet;
  const byName = product.name.toUpperCase();
  return viewCount(byName) ? byName : null;
};

/** Whether a product has rendered room images. */
export const hasRoomViews = (product) => Boolean(veneerKey(product));

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
);

/** Whether `ref` is the fullscreen element, a toggle, and whether it's supported. */
function useFullscreen(ref) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [ref]);

  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else ref.current?.requestFullscreen?.().catch(() => {});
  };
  return [isFullscreen, toggle, Boolean(document.fullscreenEnabled)];
}

/**
 * The product's veneer in the rendered room. Visitors step between the fixed
 * camera angles. Views crossfade; each image loads the first time it's shown,
 * and its neighbours are fetched ahead.
 */
export default function RoomViews({ product, onBackToSwatch }) {
  const { t } = useLanguage();
  const shellRef = useRef(null);
  const name = veneerKey(product);
  // Veneers are rendered from as many camera angles as the room needed.
  const views = Array.from({ length: viewCount(name) }, (_, i) => i + 1);
  const urls = views.map((view) => roomViewUrl(name, view, manifest.version));

  const [angle, setAngle] = useState(0);
  const [isFullscreen, toggleFullscreen, canFullscreen] = useFullscreen(shellRef);

  // Image state is keyed by veneer + view, so switching products needs no reset.
  const key = (i) => `${name}|${i}`;
  const [requested, setRequested] = useState(() => new Set());
  const [loaded, setLoaded] = useState(() => new Set());
  const [failed, setFailed] = useState(() => new Set());
  // The view on screen. It only moves to a newly picked view once that image
  // has loaded, so the previous one stays up instead of a blank panel.
  const [shown, setShown] = useState(null);

  const visible = shown?.name === name ? shown.index : null;

  useEffect(() => {
    // Veneers differ in how many views they have, so a switch can land past
    // the end of the new one.
    if (angle >= views.length) return setAngle(0);
    if (loaded.has(key(angle))) setShown({ name, index: angle });
    setRequested((s) => (s.has(key(angle)) ? s : new Set(s).add(key(angle))));
    // Warm the neighbouring angles so the arrows feel instant.
    for (const d of [-1, 1]) new Image().src = urls[(angle + d + views.length) % views.length];
  }, [angle, name]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToAngle = (i) => setAngle((i + views.length) % views.length);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToAngle(angle - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goToAngle(angle + 1); }
  };

  const add = (setter, i) => setter((set) => new Set(set).add(key(i)));
  const onImageLoad = (i) => {
    add(setLoaded, i);
    if (i === angle) setShown({ name, index: i });
  };

  return (
    <div
      ref={shellRef}
      className={`room-views${isFullscreen ? ' is-fullscreen' : ''}`}
      style={{ aspectRatio: isFullscreen ? undefined : `${manifest.size[0]} / ${manifest.size[1]}` }}
      role="region"
      aria-label={`${t.viewer.title}: ${product.name}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {views.map((view, i) =>
        requested.has(key(i)) ? (
          <img
            key={key(i)}
            src={urls[i]}
            alt={i === visible ? `${product.name}, ${t.viewer.angle} ${i + 1}` : ''}
            className={`room-views-img${i === visible ? ' is-active' : ''}`}
            onLoad={() => onImageLoad(i)}
            onError={() => add(setFailed, i)}
            draggable={false}
          />
        ) : null,
      )}

      {visible === null && (
        <div className="room-views-state">
          <span className="room-views-state-label">{failed.has(key(angle)) ? t.viewer.error : t.viewer.loading}</span>
        </div>
      )}

      {onBackToSwatch && (
        <button type="button" className="room-views-swatch" onClick={onBackToSwatch} aria-label={t.viewer.backToSwatch}>
          <img src={product.image} alt="" />
        </button>
      )}

      {canFullscreen && (
        <button
          type="button"
          className="room-views-icon room-views-fullscreen"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t.viewer.exitFullscreen : t.viewer.fullscreen}
        >
          {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
        </button>
      )}

      {views.length > 1 && (
        <>
          <button type="button" className="room-views-icon room-views-prev" onClick={() => goToAngle(angle - 1)} aria-label={t.viewer.prev}>‹</button>
          <button type="button" className="room-views-icon room-views-next" onClick={() => goToAngle(angle + 1)} aria-label={t.viewer.next}>›</button>

          <div className="room-views-bar">
            <div className="room-views-dots" role="tablist" aria-label={t.viewer.angles}>
              {views.map((view, i) => (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={angle === i}
                  aria-label={`${t.viewer.angle} ${i + 1}`}
                  className={angle === i ? 'active' : ''}
                  onClick={() => goToAngle(i)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
