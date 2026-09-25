import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import useImageCycle from '../useImageCycle.js';

/** Wood-grain SVG turbulence filter, shared by every page. */
export function WoodgrainFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="woodgrain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.85" numOctaves="4" seed="12" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.8 0.8 0.8 0 -0.35" result="grainAlpha" />
          <feComposite in="grainAlpha" in2="SourceGraphic" operator="in" result="grainClipped" />
          <feBlend in="SourceGraphic" in2="grainClipped" mode="multiply" />
        </filter>
      </defs>
    </svg>
  );
}
export default WoodgrainFilter;

/** A wood-grain swatch block. `color` may be a solid hex or a CSS gradient. className carries layout (size/radius/shadow) from the page's own CSS. */
export const Swatch = ({ color, className, style }) => (
  <div className={`swatch${className ? ' ' + className : ''}`} style={style}>
    <div className="swatch-grain" style={{ background: color }} />
  </div>
);

/** "View All" / "Learn More" style capsule button/link. */
export const pillClass = (variant) => `pill-btn${variant === 'outline' ? ' pill-btn-outline' : ''}`;

/**
 * Photographs stacked in one frame, crossfading from one to the next. The
 * frame's size comes from whatever class the caller passes.
 */
export function PhotoCycle({ images, alt, className }) {
  const [ref, shown] = useImageCycle(images.length);
  return (
    <div className={`photo-cycle${className ? ' ' + className : ''}`} ref={ref}>
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          width={img.w}
          height={img.h}
          className={i === shown ? 'is-active' : undefined}
          alt={i === shown ? alt : ''}
          loading={i === 0 ? undefined : 'lazy'}
          draggable={false}
        />
      ))}
    </div>
  );
}

/** A project, its photographs crossfading one into the next on the card. */
export function ProjectCard({ project, to }) {
  const { lang } = useLanguage();
  const room = lang === 'id' ? project.idRoom : project.room;
  return (
    <Link to={to} className="project-card">
      <PhotoCycle images={project.images} alt={`${project.title}, ${room}`} className="project-card-scene" />
      <div className="project-card-shade" />
      <div className="project-card-tag">
        <div>
          <div className="room">{room}</div>
          <div className="name">{project.title}</div>
        </div>
        <div className="project-card-expand">↗</div>
      </div>
    </Link>
  );
}
