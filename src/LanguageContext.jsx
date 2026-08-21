import React, { createContext, useContext, useEffect, useState } from 'react';

const TRANSLATIONS = {
  en: {
    nav: { about: 'About', products: 'Products', projects: 'Projects', services: 'Services', contact: 'Contact' },
    footer: {
      tagline: 'Premium natural wood veneer for architects, designers, manufacturers and homeowners.',
      explore: 'Explore', studio: 'Studio', rights: 'All rights reserved.',
    },
    home: {
      eyebrow: 'KAIU · Natural Wood Veneer',
      heroTitle1: "Where nature's elegance", heroTitle2: 'meets modern craftsmanship.',
      learnMore: 'Learn More',
      collectionsEyebrow: 'Our Collections', collectionsTitle: 'A palette drawn from the grain.',
      collectionsDesc: 'Six veneer families, each cut to reveal the character already living inside the timber — from pale Scandinavian oak to deep, smoke-dark walnut.',
      viewAllCollections: 'View All Collections',
      storyEyebrow: 'Crafted by Nature',
      storyTitle: 'Every panel begins as a story told by the tree — grain, colour, and character we simply refine, never invent.',
      storyDesc: 'We select premium veneer logs, slice them with precision, and pair each face for architects, designers and homeowners who want authenticity without compromise.',
      storyCta: 'Our Story',
      worksEyebrow: 'Selected Work', worksTitle: 'Interiors finished in KAIU veneer.',
      worksDesc: 'A recent installation for the Mercure Hotel — kitchens, dining halls and facades unified by one material language.',
      viewAllProjects: 'View All Projects',
      ctaEyebrow: 'Start a Project', ctaTitle: 'Bring the warmth of natural wood into your next space.',
      ctaButton: 'Talk to Our Team',
    },
    about: {
      eyebrow: 'About KAIU', title1: 'Crafted by nature.', title2: 'Refined by design.',
      p1: 'At KAIU, we believe exceptional interiors begin with exceptional materials. Inspired by the natural beauty of wood, we curate premium veneer solutions that bring warmth, character and timeless elegance to every space.',
      p2: "Every veneer tells a unique story through its grain, texture and colour. Rather than concealing nature's imperfections, we celebrate them — preserving the authenticity that makes each piece truly one of a kind.",
      missionEyebrow: 'Our Mission', missionTitle: 'Elegance, performance and authenticity — for the long term.',
      missionDesc: 'We provide architects, designers, manufacturers and homeowners with premium natural wood veneers that combine elegance, performance and authenticity, while preserving the beauty of nature for future generations.',
      stats: [['200+', 'Veneer Collections'], ['30+', 'Projects Delivered'], ['1', 'Continent Sourced'], ['100%', 'Natural Material']],
    },
    products: {
      eyebrow: 'Products', title: 'Collections', showMore: 'Show More',
    },
    productDetail: {
      back: '← Back to Collections', collection: 'Collection', species: 'Species', cutMethod: 'Cut Method',
      bestFor: 'Best For', finish: 'Finish', requestSample: 'Request a Sample', notFound: 'Product not found.',
    },
    projects: { eyebrow: 'Projects', title: 'Selected Work' },
    projectDetail: {
      back: '← Back to Projects', hotel: 'Mercure Hotel', location: 'Location', veneerUsed: 'Veneer Used',
      scope: 'Scope', finish: 'Finish', notFound: 'Project not found.',
    },
    services: { eyebrow: 'What we offer', title: 'Services, end to end' },
    contact: {
      eyebrow: 'Get in touch', title: "Let's talk about your next project",
      studio: 'Studio', email: 'Email', phone: 'Phone / WhatsApp', hours: 'Studio Hours',
      hoursValue: 'Monday – Saturday, 09:00 – 18:00',
      fullName: 'Full Name', fullNamePh: 'Your name',
      emailField: 'Email', emailPh: 'you@company.com',
      enquiryType: 'Phone Number', enquiryPh: '+62 8xx xxxx xxxx',
      message: 'Message', messagePh: 'Tell us about your project',
      send: 'Send Message', sending: 'Sending…',
      success: "Thank you — we'll be in touch shortly.",
      error: 'Something went wrong — please try again or reach us directly.',
    },
  },
  id: {
    nav: { about: 'Tentang', products: 'Produk', projects: 'Proyek', services: 'Layanan', contact: 'Kontak' },
    footer: {
      tagline: 'Veneer kayu alami premium untuk arsitek, desainer, produsen, dan pemilik rumah.',
      explore: 'Jelajahi', studio: 'Studio', rights: 'Hak cipta dilindungi.',
    },
    home: {
      eyebrow: 'KAIU · Veneer Kayu Alami',
      heroTitle1: 'Di mana keanggunan alam', heroTitle2: 'bertemu keahlian modern.',
      learnMore: 'Pelajari Lebih Lanjut',
      collectionsEyebrow: 'Koleksi Kami', collectionsTitle: 'Palet warna yang lahir dari serat kayu.',
      collectionsDesc: 'Enam keluarga veneer, masing-masing dipotong untuk menampilkan karakter yang sudah ada dalam kayu — dari oak Skandinavia yang pucat hingga walnut gelap berasap.',
      viewAllCollections: 'Lihat Semua Koleksi',
      storyEyebrow: 'Diciptakan oleh Alam',
      storyTitle: 'Setiap panel dimulai sebagai kisah yang diceritakan oleh pohon — serat, warna, dan karakter yang kami sempurnakan, bukan ciptakan.',
      storyDesc: 'Kami memilih kayu veneer premium, mengirisnya dengan presisi, dan memadukan setiap permukaan untuk arsitek, desainer, dan pemilik rumah yang menginginkan keaslian tanpa kompromi.',
      storyCta: 'Kisah Kami',
      worksEyebrow: 'Karya Pilihan', worksTitle: 'Interior yang diselesaikan dengan veneer KAIU.',
      worksDesc: 'Instalasi terbaru untuk Hotel Mercure — dapur, ruang makan, dan fasad yang disatukan dalam satu bahasa material.',
      viewAllProjects: 'Lihat Semua Proyek',
      ctaEyebrow: 'Mulai Proyek', ctaTitle: 'Hadirkan kehangatan kayu alami ke ruang Anda berikutnya.',
      ctaButton: 'Hubungi Tim Kami',
    },
    about: {
      eyebrow: 'Tentang KAIU', title1: 'Diciptakan oleh alam.', title2: 'Disempurnakan oleh desain.',
      p1: 'Di KAIU, kami percaya interior yang luar biasa dimulai dari material yang luar biasa. Terinspirasi oleh keindahan alami kayu, kami mengkurasi solusi veneer premium yang menghadirkan kehangatan, karakter, dan keanggunan abadi ke setiap ruang.',
      p2: 'Setiap veneer menceritakan kisah unik melalui serat, tekstur, dan warnanya. Alih-alih menyembunyikan ketidaksempurnaan alami, kami merayakannya — menjaga keaslian yang membuat setiap potongan benar-benar unik.',
      missionEyebrow: 'Misi Kami', missionTitle: 'Keanggunan, performa, dan keaslian — untuk jangka panjang.',
      missionDesc: 'Kami menyediakan arsitek, desainer, produsen, dan pemilik rumah dengan veneer kayu alami premium yang memadukan keanggunan, performa, dan keaslian, sambil menjaga keindahan alam untuk generasi mendatang.',
      stats: [['200+', 'Koleksi Veneer'], ['30+', 'Proyek Selesai'], ['1', 'Benua Sumber'], ['100%', 'Material Alami']],
    },
    products: {
      eyebrow: 'Produk', title: 'Koleksi', showMore: 'Tampilkan Lebih Banyak',
    },
    productDetail: {
      back: '← Kembali ke Koleksi', collection: 'Koleksi', species: 'Spesies', cutMethod: 'Metode Potong',
      bestFor: 'Cocok Untuk', finish: 'Finishing', requestSample: 'Minta Sampel', notFound: 'Produk tidak ditemukan.',
    },
    projects: { eyebrow: 'Proyek', title: 'Karya Pilihan' },
    projectDetail: {
      back: '← Kembali ke Proyek', hotel: 'Hotel Mercure', location: 'Lokasi', veneerUsed: 'Veneer Digunakan',
      scope: 'Cakupan', finish: 'Finishing', notFound: 'Proyek tidak ditemukan.',
    },
    services: { eyebrow: 'Apa yang kami tawarkan', title: 'Layanan menyeluruh' },
    contact: {
      eyebrow: 'Hubungi kami', title: 'Mari bicarakan proyek berikutnya',
      studio: 'Studio', email: 'Email', phone: 'Telepon / WhatsApp', hours: 'Jam Operasional',
      hoursValue: 'Senin – Sabtu, 09:00 – 18:00',
      fullName: 'Nama Lengkap', fullNamePh: 'Nama Anda',
      emailField: 'Email', emailPh: 'anda@perusahaan.com',
      enquiryType: 'Nomor Telepon', enquiryPh: '+62 8xx xxxx xxxx',
      message: 'Pesan', messagePh: 'Ceritakan tentang proyek Anda',
      send: 'Kirim Pesan', sending: 'Mengirim…',
      success: 'Terima kasih — kami akan segera menghubungi Anda.',
      error: 'Terjadi kesalahan — silakan coba lagi atau hubungi kami langsung.',
    },
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('kaiu-lang') || 'en'; } catch { return 'en'; }
  });

  useEffect(() => {
    try { localStorage.setItem('kaiu-lang', lang); } catch {}
  }, [lang]);

  const toggle = () => setLang((l) => (l === 'en' ? 'id' : 'en'));

  const value = { lang, toggle, t: TRANSLATIONS[lang] };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
