import React, { createContext, useContext, useEffect, useState } from 'react';

const TRANSLATIONS = {
  en: {
    // What a search result shows for each page that is not a veneer or a
    // project; those two take their wording from the catalogue itself.
    meta: {
      home: {
        title: 'KAIU - Recon Wood Veneer',
        description: 'KAIU supplies premium recon wood veneer to architects, designers, manufacturers and homeowners in Jakarta. Six collections, consistent sheet after sheet.',
      },
      about: {
        title: 'About KAIU - Crafted by Nature, Refined by Design',
        description: 'How KAIU selects veneer logs, slices them and pairs each face, for people who want the character of real timber without compromise.',
      },
      products: {
        title: 'Veneer Collections - Athens, Berlin, Cairo, Cannes, Oslo, Zurich',
        description: 'Browse every KAIU veneer across six collections, from pale Scandinavian oak to deep smoke-dark walnut. Hi-res sheets and room views for each.',
      },
      projects: {
        title: 'Projects - Interiors Finished in KAIU Veneer',
        description: 'Recent fit-outs across Jakarta in KAIU veneer, from a private residence in Kuningan to a tea shop in Ciputra Mall and a restaurant in Blok M.',
      },
      services: {
        title: 'Services - From Veneer to Finished Surface',
        description: 'Veneer supply, matching, pressing and finishing. What KAIU can take on between choosing a sheet and installing the surface.',
      },
      contact: {
        title: 'Contact KAIU - Wood Veneer, North Jakarta',
        description: 'Talk to the KAIU team about a project or request a sample. Studio in Pluit, North Jakarta, open Monday to Friday.',
      },
      notFound: { title: 'Page Not Found', description: '' },
    },
    nav: { home: 'Home', about: 'About', products: 'Products', projects: 'Projects', services: 'Services', contact: 'Contact', inquire: 'Inquire now' },
    a11y: {
      openMenu: 'Open menu', closeMenu: 'Close menu', switchLanguage: 'Ganti ke Bahasa Indonesia',
      whatsapp: 'Chat with KAIU on WhatsApp',
      prevProject: 'Previous project', nextProject: 'Next project', slide: 'Project {n} of {total}',
      prevProjects: 'Previous projects', nextProjects: 'Next projects', projectControls: 'Featured project controls',
      skip: 'Skip to content',
    },
    footer: {
      tagline: 'Premium recon veneer for modern living. From veneer to finished surface, we bring ideas to life.',
      explore: 'Explore', studio: 'Studio', rights: 'All rights reserved.',
      services: 'Services', serviceVeneer: 'Recon veneer', servicePanel: 'Panel fabrication', serviceFinishing: 'Natural finishing',
    },
    home: {
      eyebrow: 'Recon veneer for modern living',
      heroTitle1: 'From Vision', heroTitle2: 'to Real Spaces',
      heroDesc: 'Premium recon veneer that brings natural beauty, consistency and durability to every surface.',
      exploreProducts: 'Explore products', viewProjects: 'View projects',

      sectorResidential: 'Residential', sectorCommercial: 'Commercial',
      sectorHospitality: 'Hospitality', sectorOffice: 'Office',
      sectorLink: 'View projects',

      materialEyebrow: 'Our material',
      materialTitle1: 'Recon Veneer,', materialTitle2: 'Endless Possibilities',
      materialDesc: 'Recon (reconstituted) veneer is real timber, sliced, dyed and re-pressed so the grain repeats sheet after sheet. You get the look and feel of natural wood, with the consistency and stability that one-off logs cannot promise.',
      m1t: 'Authentic wood aesthetics', m1d: 'Real wood, beautifully engineered',
      m2t: 'Consistent quality', m2d: 'Uniform grain and colour',
      m3t: 'Wide design options', m3d: 'A diverse range of textures and tones',
      m4t: 'Durable and stable', m4d: 'Ideal for modern living spaces',
      exploreCollection: 'Explore our collection',


      processEyebrow: 'The process',
      processTitle1: 'From Veneer', processTitle2: 'to Finished Surface',
      processDesc: 'High-quality materials, expert fabrication and natural finishing for a surface that lasts.',
      p1t: 'Veneer selection', p1d: 'Choose from our curated recon veneer collection.',
      p2t: 'Panel fabrication', p2d: 'Veneer applied onto HMR or plywood with precision.',
      p3t: 'Natural finishing', p3d: 'Finished with water-based, food-grade hard oil wax.',

      worksEyebrow: 'Featured projects',
      worksTitle1: 'Real Spaces,', worksTitle2: 'Real Stories',
      viewAllProjects: 'View all projects',

      ctaEyebrow: "Let's build together",
      ctaTitle: 'Bring Your Vision to Life',
      ctaDesc: "Whether it's a residential, commercial or hospitality project, we're here to help you find the perfect veneer solution.",
      ctaButton: 'Inquire now',
    },
    about: {
      eyebrow: 'About KAIU', title1: 'Crafted by nature.', title2: 'Refined by design.',
      p1: 'At KAIU, we believe exceptional interiors begin with exceptional materials. Inspired by the natural beauty of wood, we curate premium veneer solutions that bring warmth, character and timeless elegance to every space.',
      p2: "Every veneer tells a unique story through its grain, texture and colour. Rather than concealing nature's imperfections, we celebrate them, preserving the authenticity that makes each piece truly one of a kind.",
      missionEyebrow: 'Our Mission', missionTitle: 'Elegance, performance and authenticity. For the long term.',
      missionDesc: 'We provide architects, designers, manufacturers and homeowners with premium recon wood veneer that combines elegance, performance and consistency — real timber, engineered so the grain repeats sheet after sheet.',
      stats: [['200+', 'Veneer Collections'], ['30+', 'Projects Delivered'], ['100%', 'Natural Material']],
    },
    products: {
      eyebrow: 'Products', title: 'Collections',
      toneLabel: 'Tone',
      tones: { all: 'All tones', light: 'Light', warm: 'Warm', cool: 'Cool', dark: 'Dark', colorful: 'Colorful' },
      searchLabel: 'Search', searchPlaceholder: 'oak, burl, sapphire…',
      resultOne: 'result', resultMany: 'results',
      empty: 'No veneer matches these filters.', reset: 'Clear filters', showMore: 'Show more veneers',
    },
    productDetail: {
      back: '← Back to Collections', collection: 'Collection', collectionOf: '{name} Collection', requestSample: 'Request a Sample',
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
      back: '← Back to Projects', client: 'Client', location: 'Location',
      veneerUsed: 'Veneer Used', veneersUsed: 'Veneers Used',
      designer: 'Interior Designer', photo: 'photo', notFound: 'Project not found.',
    },
    services: { eyebrow: 'What we offer', title: 'From veneer to finished surface' },
    contact: {
      eyebrow: 'Get in touch', title: "Let's talk about your next surface",
      studio: 'Studio', email: 'Email', phone: 'Phone / WhatsApp', hours: 'Studio Hours',
      hoursValue: 'Monday to Friday, 09:00 to 18:00',
      fullName: 'Full Name', fullNamePh: 'Your name',
      emailField: 'Email', emailPh: 'you@company.com',
      phoneField: 'Phone Number', phonePh: '+62 8xx xxxx xxxx', optional: 'optional',
      message: 'Message', messagePh: 'Tell us about your project',
      send: 'Send Message', sending: 'Sending…',
      success: "Thank you. We'll be in touch shortly.",
      error: 'Something went wrong. Please try again or reach us directly.',
      errorValidation: 'Please check the fields above and try again.',
      errorValidationFields: 'Please check and try again:',
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
    meta: {
      home: {
        title: 'KAIU - Veneer Kayu Rekon',
        description: 'KAIU memasok veneer kayu alami premium untuk arsitek, desainer, produsen, dan pemilik rumah di Jakarta. Enam koleksi, dipotong dan dipasangkan sesuai pesanan.',
      },
      about: {
        title: 'Tentang KAIU - Diciptakan Alam, Disempurnakan Desain',
        description: 'Bagaimana KAIU memilih log veneer, mengirisnya, dan memasangkan setiap permukaan, untuk mereka yang menginginkan karakter kayu asli tanpa kompromi.',
      },
      products: {
        title: 'Koleksi Veneer - Athens, Berlin, Cairo, Cannes, Oslo, Zurich',
        description: 'Jelajahi seluruh veneer KAIU dalam enam koleksi, dari oak Skandinavia yang pucat hingga walnut gelap berasap. Lembaran resolusi tinggi dan tampilan ruangan.',
      },
      projects: {
        title: 'Proyek - Interior dengan Veneer KAIU',
        description: 'Pengerjaan terbaru di Jakarta dengan veneer KAIU, dari hunian pribadi di Kuningan hingga kedai teh di Mal Ciputra dan restoran di Blok M.',
      },
      services: {
        title: 'Layanan - Dari Veneer hingga Permukaan Akhir',
        description: 'Penyediaan veneer, pencocokan, pengepresan, dan finishing. Apa yang dapat KAIU kerjakan antara memilih lembaran dan memasang permukaannya.',
      },
      contact: {
        title: 'Hubungi KAIU - Veneer Kayu, Jakarta Utara',
        description: 'Bicarakan proyek Anda dengan tim KAIU atau minta sampel. Studio di Pluit, Jakarta Utara, buka Senin sampai Jumat.',
      },
      notFound: { title: 'Halaman Tidak Ditemukan', description: '' },
    },
    nav: { home: 'Beranda', about: 'Tentang', products: 'Produk', projects: 'Proyek', services: 'Layanan', contact: 'Kontak', inquire: 'Hubungi kami' },
    a11y: {
      openMenu: 'Buka menu', closeMenu: 'Tutup menu', switchLanguage: 'Switch to English',
      whatsapp: 'Chat dengan KAIU via WhatsApp',
      prevProject: 'Proyek sebelumnya', nextProject: 'Proyek berikutnya', slide: 'Proyek {n} dari {total}',
      prevProjects: 'Proyek sebelumnya', nextProjects: 'Proyek berikutnya', projectControls: 'Kontrol proyek pilihan',
      skip: 'Langsung ke konten',
    },
    footer: {
      tagline: 'Veneer rekon premium untuk hunian modern. Dari veneer hingga permukaan jadi, kami wujudkan ide Anda.',
      explore: 'Jelajahi', studio: 'Studio', rights: 'Hak cipta dilindungi.',
      services: 'Layanan', serviceVeneer: 'Veneer rekon', servicePanel: 'Fabrikasi panel', serviceFinishing: 'Finishing alami',
    },
    home: {
      eyebrow: 'Veneer rekon untuk hunian modern',
      heroTitle1: 'Dari Visi', heroTitle2: 'ke Ruang Nyata',
      heroDesc: 'Veneer rekon premium yang menghadirkan keindahan alami, konsistensi, dan ketahanan pada setiap permukaan.',
      exploreProducts: 'Lihat produk', viewProjects: 'Lihat proyek',

      sectorResidential: 'Residensial', sectorCommercial: 'Komersial',
      sectorHospitality: 'Hospitality', sectorOffice: 'Perkantoran',
      sectorLink: 'Lihat proyek',

      materialEyebrow: 'Material kami',
      materialTitle1: 'Veneer Rekon,', materialTitle2: 'Kemungkinan Tanpa Batas',
      materialDesc: 'Veneer rekon (rekonstitusi) adalah kayu asli yang diiris, diwarnai, lalu dipres ulang sehingga seratnya berulang dari lembar ke lembar. Anda mendapat tampilan dan rasa kayu alami, dengan konsistensi dan kestabilan yang tidak bisa dijanjikan satu batang kayu.',
      m1t: 'Estetika kayu autentik', m1d: 'Kayu asli, direkayasa dengan indah',
      m2t: 'Kualitas konsisten', m2d: 'Serat dan warna yang seragam',
      m3t: 'Pilihan desain luas', m3d: 'Beragam tekstur dan nuansa warna',
      m4t: 'Awet dan stabil', m4d: 'Ideal untuk ruang hunian modern',
      exploreCollection: 'Lihat koleksi kami',


      processEyebrow: 'Prosesnya',
      processTitle1: 'Dari Veneer', processTitle2: 'ke Permukaan Jadi',
      processDesc: 'Material berkualitas, fabrikasi ahli, dan finishing alami untuk permukaan yang tahan lama.',
      p1t: 'Pemilihan veneer', p1d: 'Pilih dari koleksi veneer rekon kami yang terkurasi.',
      p2t: 'Fabrikasi panel', p2d: 'Veneer diaplikasikan pada HMR atau plywood dengan presisi.',
      p3t: 'Finishing alami', p3d: 'Diselesaikan dengan hard oil wax berbahan air, food-grade.',

      worksEyebrow: 'Proyek pilihan',
      worksTitle1: 'Ruang Nyata,', worksTitle2: 'Cerita Nyata',
      viewAllProjects: 'Lihat semua proyek',

      ctaEyebrow: 'Mari bangun bersama',
      ctaTitle: 'Wujudkan Visi Anda',
      ctaDesc: 'Baik proyek residensial, komersial, maupun hospitality, kami siap membantu Anda menemukan solusi veneer yang tepat.',
      ctaButton: 'Hubungi kami',
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
      eyebrow: 'Produk', title: 'Koleksi',
      toneLabel: 'Nuansa',
      tones: { all: 'Semua nuansa', light: 'Terang', warm: 'Hangat', cool: 'Sejuk', dark: 'Gelap', colorful: 'Berwarna' },
      searchLabel: 'Cari', searchPlaceholder: 'oak, burl, sapphire…',
      resultOne: 'hasil', resultMany: 'hasil',
      empty: 'Tidak ada veneer yang cocok dengan filter ini.', reset: 'Hapus filter', showMore: 'Tampilkan lebih banyak',
    },
    productDetail: {
      back: '← Kembali ke Koleksi', collection: 'Koleksi', collectionOf: 'Koleksi {name}', requestSample: 'Minta Sampel',
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
      back: '← Kembali ke Proyek', client: 'Klien', location: 'Lokasi',
      veneerUsed: 'Veneer Digunakan', veneersUsed: 'Veneer Digunakan',
      designer: 'Desainer Interior', photo: 'foto', notFound: 'Proyek tidak ditemukan.',
    },
    services: { eyebrow: 'Apa yang kami tawarkan', title: 'Dari veneer hingga permukaan akhir' },
    contact: {
      eyebrow: 'Hubungi kami', title: 'Mari bicarakan permukaan berikutnya',
      studio: 'Studio', email: 'Email', phone: 'Telepon / WhatsApp', hours: 'Jam Operasional',
      hoursValue: 'Senin sampai Jumat, 09:00 sampai 18:00',
      fullName: 'Nama Lengkap', fullNamePh: 'Nama Anda',
      emailField: 'Email', emailPh: 'anda@perusahaan.com',
      phoneField: 'Nomor Telepon', phonePh: '+62 8xx xxxx xxxx', optional: 'opsional',
      message: 'Pesan', messagePh: 'Ceritakan tentang proyek Anda',
      send: 'Kirim Pesan', sending: 'Mengirim…',
      success: 'Terima kasih. Kami akan segera menghubungi Anda.',
      error: 'Terjadi kesalahan. Silakan coba lagi atau hubungi kami langsung.',
      errorValidation: 'Mohon periksa kembali isian di atas lalu coba lagi.',
      errorValidationFields: 'Mohon periksa kembali lalu coba lagi:',
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
    // Tells a browser, a screen reader and a crawler which language they are
    // reading; the markup declares English and the switch has to update it.
    document.documentElement.lang = lang;
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
