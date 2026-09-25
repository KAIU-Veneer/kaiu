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
      learnMore: 'Learn More →',
      collectionsEyebrow: 'Our Collections', collectionsTitle: 'A palette drawn from the grain.',
      collectionsDesc: 'Six veneer families, each cut to reveal the character already living inside the timber, from pale Scandinavian oak to deep, smoke-dark walnut.',
      viewAllCollections: 'View All Collections',
      storyEyebrow: 'Crafted by Nature',
      storyTitle: 'Every panel begins as a story told by the tree: grain, colour, and character we simply refine, never invent.',
      storyDesc: 'We select premium veneer logs, slice them with precision, and pair each face for architects, designers and homeowners who want authenticity without compromise.',
      storyCta: 'Our Story',
      worksEyebrow: 'Selected Work', worksTitle: 'Interiors finished in KAIU veneer.',
      worksDesc: "Recent fit-outs across Jakarta, from a children's room in Kuningan to a tea shop and a restaurant.",
      viewAllProjects: 'View All Projects',
      ctaEyebrow: 'Start a Project', ctaTitle: 'Bring the warmth of natural wood into your next space.',
      ctaButton: 'Talk to Our Team',
    },
    about: {
      eyebrow: 'About KAIU', title1: 'Crafted by nature.', title2: 'Refined by design.',
      p1: 'At KAIU, we believe exceptional interiors begin with exceptional materials. Inspired by the natural beauty of wood, we curate premium veneer solutions that bring warmth, character and timeless elegance to every space.',
      p2: "Every veneer tells a unique story through its grain, texture and colour. Rather than concealing nature's imperfections, we celebrate them, preserving the authenticity that makes each piece truly one of a kind.",
      missionEyebrow: 'Our Mission', missionTitle: 'Elegance, performance and authenticity. For the long term.',
      missionDesc: 'We provide architects, designers, manufacturers and homeowners with premium natural wood veneers that combine elegance, performance and authenticity, while preserving the beauty of nature for future generations.',
      stats: [['200+', 'Veneer Collections'], ['30+', 'Projects Delivered'], ['100%', 'Natural Material']],
    },
    products: {
      eyebrow: 'Products', title: 'Collections', showMore: 'Show More',
    },
    productDetail: {
      back: '← Back to Collections', collection: 'Collection', requestSample: 'Request a Sample',
      notFound: 'Product not found.', dimension: 'Dimension', downloadHiRes: 'Download Hi-Res',
    },
    viewer: {
      open: 'View in Room', title: 'Room view', loading: 'Loading the room',
      error: 'The room view could not be loaded. Please try again.',
      prev: 'Previous angle', next: 'Next angle',
      angles: 'Camera angles', angle: 'Angle', fullscreen: 'Enter fullscreen', exitFullscreen: 'Exit fullscreen',
      backToSwatch: 'View veneer swatch',
    },
    projects: { eyebrow: 'Projects', title: 'Selected Work' },
    projectDetail: {
      back: '← Back to Projects', client: 'Client', location: 'Location', veneerUsed: 'Veneer Used',
      designer: 'Interior Designer', photo: 'photo', notFound: 'Project not found.',
    },
    services: { eyebrow: 'What we offer', title: 'From veneer to finished surface' },
    contact: {
      eyebrow: 'Get in touch', title: "Let's talk about your next surface",
      studio: 'Studio', email: 'Email', phone: 'Phone / WhatsApp', hours: 'Studio Hours',
      hoursValue: 'Monday to Friday, 09:00 to 18:00',
      fullName: 'Full Name', fullNamePh: 'Your name',
      emailField: 'Email', emailPh: 'you@company.com',
      enquiryType: 'Phone Number', enquiryPh: '+62 8xx xxxx xxxx',
      message: 'Message', messagePh: 'Tell us about your project',
      send: 'Send Message', sending: 'Sending…',
      success: "Thank you. We'll be in touch shortly.",
      error: 'Something went wrong. Please try again or reach us directly.',
      errorValidation: 'Please check the fields above and try again.',
      errorRateLimited: 'Too many messages from this device. Please try again shortly.',
      errorNetwork: 'We could not reach the server. Check your connection and try again.',
    },
    notFound: {
      eyebrow: 'Error 404',
      title: 'This page is off the grain.',
      desc: 'The page you were looking for has been moved, renamed, or never existed. The collections below are a good place to pick the thread back up.',
      home: 'Back to Home',
      products: 'Browse Collections',
      contact: 'Contact Us',
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
      learnMore: 'Pelajari Lebih Lanjut →',
      collectionsEyebrow: 'Koleksi Kami', collectionsTitle: 'Palet warna yang lahir dari serat kayu.',
      collectionsDesc: 'Enam keluarga veneer, masing-masing dipotong untuk menampilkan karakter yang sudah ada dalam kayu, dari oak Skandinavia yang pucat hingga walnut gelap berasap.',
      viewAllCollections: 'Lihat Semua Koleksi',
      storyEyebrow: 'Diciptakan oleh Alam',
      storyTitle: 'Setiap panel dimulai sebagai kisah yang diceritakan oleh pohon, serat, warna, dan karakter yang kami sempurnakan, bukan ciptakan.',
      storyDesc: 'Kami memilih kayu veneer premium, mengirisnya dengan presisi, dan memadukan setiap permukaan untuk arsitek, desainer, dan pemilik rumah yang menginginkan keaslian tanpa kompromi.',
      storyCta: 'Kisah Kami',
      worksEyebrow: 'Karya Pilihan', worksTitle: 'Interior yang diselesaikan dengan veneer KAIU.',
      worksDesc: 'Pengerjaan terbaru di berbagai penjuru Jakarta, mulai dari kamar anak di Kuningan hingga kedai teh dan restoran.',
      viewAllProjects: 'Lihat Semua Proyek',
      ctaEyebrow: 'Mulai Proyek', ctaTitle: 'Hadirkan kehangatan kayu alami ke ruang Anda berikutnya.',
      ctaButton: 'Hubungi Tim Kami',
    },
    about: {
      eyebrow: 'Tentang KAIU', title1: 'Diciptakan oleh alam.', title2: 'Disempurnakan oleh desain.',
      p1: 'Di KAIU, kami percaya interior yang luar biasa dimulai dari material yang luar biasa. Terinspirasi oleh keindahan alami kayu, kami mengkurasi solusi veneer premium yang menghadirkan kehangatan, karakter, dan keanggunan abadi ke setiap ruang.',
      p2: 'Setiap veneer menceritakan kisah unik melalui serat, tekstur, dan warnanya. Alih-alih menyembunyikan ketidaksempurnaan alami, kami merayakannya, menjaga keaslian yang membuat setiap potongan benar-benar unik.',
      missionEyebrow: 'Misi Kami', missionTitle: 'Keanggunan, performa, dan keaslian. Untuk jangka panjang.',
      missionDesc: 'Kami menyediakan arsitek, desainer, produsen, dan pemilik rumah dengan veneer kayu alami premium yang memadukan keanggunan, performa, dan keaslian, sambil menjaga keindahan alam untuk generasi mendatang.',
      stats: [['200+', 'Koleksi Veneer'], ['30+', 'Proyek Selesai'], ['100%', 'Material Alami']],
    },
    products: {
      eyebrow: 'Produk', title: 'Koleksi', showMore: 'Tampilkan Lebih Banyak',
    },
    productDetail: {
      back: '← Kembali ke Koleksi', collection: 'Koleksi', requestSample: 'Minta Sampel',
      notFound: 'Produk tidak ditemukan.', dimension: 'Dimensi', downloadHiRes: 'Unduh Resolusi Tinggi',
    },
    viewer: {
      open: 'Lihat di Ruangan', title: 'Tampilan ruangan', loading: 'Memuat ruangan',
      error: 'Tampilan ruangan tidak dapat dimuat. Silakan coba lagi.',
      prev: 'Sudut sebelumnya', next: 'Sudut berikutnya',
      angles: 'Sudut kamera', angle: 'Sudut', fullscreen: 'Layar penuh', exitFullscreen: 'Keluar layar penuh',
      backToSwatch: 'Lihat sampel veneer',
    },
    projects: { eyebrow: 'Proyek', title: 'Karya Pilihan' },
    projectDetail: {
      back: '← Kembali ke Proyek', client: 'Klien', location: 'Lokasi', veneerUsed: 'Veneer Digunakan',
      designer: 'Desainer Interior', photo: 'foto', notFound: 'Proyek tidak ditemukan.',
    },
    services: { eyebrow: 'Apa yang kami tawarkan', title: 'Dari veneer hingga permukaan akhir' },
    contact: {
      eyebrow: 'Hubungi kami', title: 'Mari bicarakan permukaan berikutnya',
      studio: 'Studio', email: 'Email', phone: 'Telepon / WhatsApp', hours: 'Jam Operasional',
      hoursValue: 'Senin sampai Jumat, 09:00 sampai 18:00',
      fullName: 'Nama Lengkap', fullNamePh: 'Nama Anda',
      emailField: 'Email', emailPh: 'anda@perusahaan.com',
      enquiryType: 'Nomor Telepon', enquiryPh: '+62 8xx xxxx xxxx',
      message: 'Pesan', messagePh: 'Ceritakan tentang proyek Anda',
      send: 'Kirim Pesan', sending: 'Mengirim…',
      success: 'Terima kasih. Kami akan segera menghubungi Anda.',
      error: 'Terjadi kesalahan. Silakan coba lagi atau hubungi kami langsung.',
      errorValidation: 'Mohon periksa kembali isian di atas lalu coba lagi.',
      errorRateLimited: 'Terlalu banyak pesan dari perangkat ini. Silakan coba lagi sebentar.',
      errorNetwork: 'Kami tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi.',
    },
    notFound: {
      eyebrow: 'Error 404',
      title: 'Halaman ini keluar dari serat.',
      desc: 'Halaman yang Anda cari telah dipindahkan, diganti nama, atau memang tidak pernah ada. Koleksi kami di bawah ini adalah tempat yang baik untuk melanjutkan.',
      home: 'Kembali ke Beranda',
      products: 'Lihat Koleksi',
      contact: 'Hubungi Kami',
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
