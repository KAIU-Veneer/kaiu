import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import WoodgrainFilter from './components/Shared.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <WoodgrainFilter />
      <Header />
      <ScrollToTop />
      <main className="app-main">
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
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
