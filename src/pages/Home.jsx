import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swatch, pillClass, ProjectCard } from "../components/Shared.jsx";
import { PRODUCTS, PROJECTS } from "../data.js";
import { useLanguage } from "../LanguageContext.jsx";
import useReveal from "../useReveal.js";
import "./Home.css";

const HERO_IMAGES = [
  "/assets/image/CANNES WASHED OAK.webp",
  "/assets/image/CANNES GOLDEN WALNUT.webp",
  "/assets/image/CANNES ECLIPSE.webp",
  "/assets/image/OSLO CHAMPAGNE ELM.webp",
  "/assets/image/ATHENS SABLE WALNUT.webp",
  "/assets/image/BERLIN BLACK OAKWOOD.webp",
];

function shortDesc(text) {
  if (!text) return '';
  return text.split(/(?<=[.!?])\s/)[0];
}

function displayName(name, collectionLabel) {
  const prefix = collectionLabel + ' ';
  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
}

export default function Home() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const homeProducts = PRODUCTS.slice(0, 4);
  const homeProjects = PROJECTS.slice(0, 3);
  const collectionsRef = useReveal();
  const storyRef = useReveal();
  const worksRef = useReveal();
  const ctaRef = useReveal();

  return (
    <div>
      <section className="hero">
        <div className="hero-swatches">
          {HERO_IMAGES.map((src) => (
            <img key={src} src={src} className="hero-swatch" alt="Veneer" />
          ))}
        </div>
        <div className="hero-copy">
          <span className="eyebrow">{t.home.eyebrow}</span>
          <h1>
            {t.home.heroTitle1}
            <br />
            {t.home.heroTitle2}
          </h1>
          <button className="hero-cta" onClick={() => navigate("/products")}>
            {t.home.learnMore}
          </button>
        </div>
      </section>

      <hr className="hairline" />

      <section className="home-section reveal" ref={collectionsRef}>
        <div className="section-head">
          <div>
            <span className="eyebrow">{t.home.collectionsEyebrow}</span>
            <h2>{t.home.collectionsTitle}</h2>
          </div>
          <p>{t.home.collectionsDesc}</p>
        </div>
        <div className="product-grid">
          {homeProducts.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="product-card">
              <img
                src={p.image}
                className="swatch"
                alt={p.name}
                loading="lazy"
              />
              <h4>{displayName(p.name, p.collectionLabel)}</h4>
              <span className="product-collection-label">{t.productDetail.collection}: {p.collectionLabel.toUpperCase()}</span>
              <span className="product-short-desc">{shortDesc(lang === "id" ? p.idLongDesc : p.longDesc)}</span>
            </Link>
          ))}
        </div>
        <div className="center-cta">
          <Link to="/products" className={pillClass("outline")}>
            {t.home.viewAllCollections}
          </Link>
        </div>
      </section>

      <section className="story-section reveal" ref={storyRef}>
        <div>
          <span className="eyebrow">{t.home.storyEyebrow}</span>
          <h2>{t.home.storyTitle}</h2>
          <p>{t.home.storyDesc}</p>
          <Link to="/about" className="story-cta">
            {t.home.storyCta}
          </Link>
        </div>
        <img src="/assets/stock images/wood.jpg" className="story-swatch" style={{ objectFit: 'cover', width: '100%', display: 'block' }} alt="" />
      </section>

      <section className="home-section reveal" ref={worksRef}>
        <div className="section-head">
          <div>
            <span className="eyebrow">{t.home.worksEyebrow}</span>
            <h2>{t.home.worksTitle}</h2>
          </div>
          <p>{t.home.worksDesc}</p>
        </div>
        <div className="project-grid">
          {homeProjects.map((pr) => (
            <ProjectCard key={pr.id} project={pr} to={`/projects/${pr.id}`} />
          ))}
        </div>
        <div className="center-cta">
          <Link to="/projects" className={pillClass("outline")}>
            {t.home.viewAllProjects}
          </Link>
        </div>
      </section>

      <section className="section-alt reveal" ref={ctaRef}>
        <span className="eyebrow">{t.home.ctaEyebrow}</span>
        <h2 style={{ maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          {t.home.ctaTitle}
        </h2>
        <Link to="/contact" className={pillClass()} style={{ marginTop: 30 }}>
          {t.home.ctaButton}
        </Link>
      </section>
    </div>
  );
}
