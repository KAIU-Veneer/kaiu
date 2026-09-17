import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../LanguageContext.jsx';
import { createRoomScene } from './createRoomScene.js';
import './RoomViewer3D.css';

// Lets the product page start the download on hover, before the click.
export { preloadRoomModel } from './model.js';

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
);

/** Whether `ref` is the fullscreen element, plus a toggle. */
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
 * One shared 3D room with the product's veneer on the feature wall. Visitors
 * can only step between fixed camera angles and a close-up.
 *
 * textureUrl:  web copy of the product's hi-res sheet (npm run textures)
 * fallbackUrl: the original sheet, used if the web copy hasn't been made yet
 */
export default function RoomViewer3D({ textureUrl, fallbackUrl, label, swatchImage, onBackToSwatch }) {
  const { t } = useLanguage();
  const shellRef = useRef(null);
  const canvasHostRef = useRef(null);
  const roomRef = useRef(null);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [progress, setProgress] = useState(0);
  const [angleCount, setAngleCount] = useState(0);
  const [angle, setAngle] = useState(0);
  const [closeUp, setCloseUp] = useState(false);
  const [isFullscreen, toggleFullscreen, canFullscreen] = useFullscreen(shellRef);

  useEffect(() => {
    let room;
    try {
      room = createRoomScene(canvasHostRef.current, {
        onProgress: setProgress,
        onReady: ({ angleCount: count }) => {
          setAngleCount(count);
          setStatus('ready');
        },
        onError: () => setStatus('error'),
      });
    } catch {
      setStatus('error'); // no WebGL
      return undefined;
    }
    roomRef.current = room;
    return () => {
      room.dispose();
      roomRef.current = null;
    };
  }, []);

  useEffect(() => {
    roomRef.current?.setVeneer(textureUrl, fallbackUrl);
  }, [textureUrl, fallbackUrl]);

  useEffect(() => {
    roomRef.current?.show({ angle, closeUp });
  }, [angle, closeUp]);

  const goToAngle = (i) => {
    setCloseUp(false);
    setAngle((i + angleCount) % angleCount);
  };

  const onKeyDown = (e) => {
    if (status !== 'ready') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToAngle(angle - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goToAngle(angle + 1); }
  };

  return (
    <div
      ref={shellRef}
      className={`room3d${isFullscreen ? ' is-fullscreen' : ''}`}
      role="region"
      aria-label={`${t.viewer.title}: ${label}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div ref={canvasHostRef} className="room3d-canvas" />

      {status !== 'ready' && (
        <div className="room3d-state">
          <span className="room3d-state-label">{status === 'error' ? t.viewer.error : t.viewer.loading}</span>
          {status === 'loading' && (
            <span className="room3d-progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /></span>
          )}
        </div>
      )}

      {swatchImage && onBackToSwatch && (
        <button type="button" className="room3d-swatch" onClick={onBackToSwatch} aria-label={t.viewer.backToSwatch}>
          <img src={swatchImage} alt="" />
        </button>
      )}

      {canFullscreen && (
        <button
          type="button"
          className="room3d-icon room3d-fullscreen"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t.viewer.exitFullscreen : t.viewer.fullscreen}
        >
          {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
        </button>
      )}

      {status === 'ready' && (
        <>
          <button type="button" className="room3d-icon room3d-prev" onClick={() => goToAngle(angle - 1)} aria-label={t.viewer.prev}>‹</button>
          <button type="button" className="room3d-icon room3d-next" onClick={() => goToAngle(angle + 1)} aria-label={t.viewer.next}>›</button>

          <div className="room3d-bar">
            <div className="room3d-dots" role="tablist" aria-label={t.viewer.angles}>
              {Array.from({ length: angleCount }, (_, i) => {
                const active = !closeUp && angle === i;
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`${t.viewer.angle} ${i + 1}`}
                    className={active ? 'active' : ''}
                    onClick={() => goToAngle(i)}
                  />
                );
              })}
            </div>
            <button
              type="button"
              className={`room3d-close${closeUp ? ' active' : ''}`}
              aria-pressed={closeUp}
              onClick={() => setCloseUp((c) => !c)}
            >
              {closeUp ? t.viewer.roomView : t.viewer.closeUp}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
