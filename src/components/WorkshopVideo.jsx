import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext.jsx';
import './WorkshopVideo.css';

const WORKSHOP_VIDEO_ID = 'bKxNFn6eYJk';

// The workshop film, shown on Home and Services. The YouTube player only
// loads once the section is near the viewport; until then the thumbnail
// holds its place.
export default function WorkshopVideo() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    if (!('IntersectionObserver' in window)) {
      setStarted(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px 0px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="workshop-video on-dark" data-header-surface="colored">
      <div className="workshop-video-copy">
        <h2><span>{t.home.videoTitleTop}</span><span>{t.home.videoTitleBottom}</span></h2>
        <p>{t.home.videoDesc}</p>
      </div>
      <div className="workshop-player">
        <img
          src={`https://i.ytimg.com/vi/${WORKSHOP_VIDEO_ID}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
        />
        {started && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${WORKSHOP_VIDEO_ID}?autoplay=1&mute=1&playsinline=1&controls=1&rel=0&loop=1&playlist=${WORKSHOP_VIDEO_ID}`}
            title={`${t.home.videoTitleTop} ${t.home.videoTitleBottom}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            allowFullScreen
          />
        )}
      </div>
    </section>
  );
}
