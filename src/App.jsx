import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import WoodgrainFilter from './components/Shared.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import Home from './pages/Home.jsx';

/**
 * The home page is part of the first download, since it is what most visitors
 * land on and waiting on a second request would only delay it. Every other
 * page is fetched when it is first opened, which keeps its code and its
 * stylesheet out of that first download.
 */
const About = lazy(() => import('./pages/About.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <div className="app-shell">
      <WoodgrainFilter />
      <Header />
      <ScrollToTop />
      <main className="app-main">
        {/* Blank rather than a spinner: on a warm connection the page arrives
            in a few milliseconds and a flashing message reads as a fault. */}
        <Suspense fallback={<div className="route-pending" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
      {/* Counts visits. Vercel serves its script and takes its readings from
          this site's own domain, under /_vercel/insights, so the policy in
          vercel.json needs no third party added to it and no cookie is set.
          It reports nothing until Web Analytics is switched on for the
          project in the Vercel dashboard. */}
      <Analytics />
    </div>
  );
}
