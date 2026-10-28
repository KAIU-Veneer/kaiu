import React, { createContext, useContext, useEffect, useState } from 'react';

const TRANSLATIONS = {
  en: {
    // What a search result shows for each page that is not a veneer or a
    // project; those two take their wording from the catalogue itself.
    meta: {
      home: {
        title: 'KAIU - Wood Veneer',
        description: 'KAIU supplies premium wood veneer to architects, designers, manufacturers and homeowners in Jakarta. Six collections, consistent sheet after sheet.',
      },
      about: {
        title: 'About KAIU - More Than a Surface',
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
      tagline: 'Premium wood veneer for modern living. From veneer to finished surface, we bring ideas to life.',
      explore: 'Explore', studio: 'Studio', rights: 'All rights reserved.',
      services: 'Services', serviceVeneer: 'Wood veneer', servicePanel: 'Panel fabrication', serviceFinishing: 'Natural finishing',
    },
    home: {
            heroTitle1: 'From Vision', heroTitle2: 'to Real Spaces',
      heroDesc: 'Premium wood veneer that brings natural beauty, consistency and durability to every surface.',
      exploreProducts: 'Explore products', viewProjects: 'View projects',

      sectorResidential: 'Residential', sectorCommercial: 'Commercial',
      sectorHospitality: 'Hospitality', sectorOffice: 'Office',
      sectorLink: 'View projects',

            materialTitle1: 'Veneer,', materialTitle2: 'Endless Possibilities',
      materialDesc: 'Made from real timber, each veneer is sliced, dyed and re-pressed so the grain repeats sheet after sheet. Enjoy the look and feel of natural wood with consistent colour and pattern.',
      m1t: 'Authentic wood aesthetics', m1d: 'Real wood, beautifully engineered',
      m2t: 'Consistent quality', m2d: 'Uniform grain and colour',
      m3t: 'Wide design options', m3d: 'A diverse range of textures and tones',
      m4t: 'Durable and stable', m4d: 'Ideal for modern living spaces',
      exploreCollection: 'Explore our collection',
      sheetsLabel: 'Seven of our veneers, light to dark',
      whyEyebrow: 'Why KAIU', whyTitle: 'More Than a Surface',
      whyDesc: 'We combine craftsmanship, technology and design to create veneer for considered interiors and everyday living.',
      w1t: 'Curated selection', w1d: 'A wide range of modern wood designs',
      w2t: 'Reliable supply', w2d: 'Consistent quality at every scale',
      w3t: 'Trusted by professionals', w3d: 'Chosen for residential, commercial and hospitality spaces',
      w4t: 'End to end support', w4d: 'Guidance from material selection through application',


            processTitle1: 'What we do', processTitle2: 'with veneer',
      processDesc: 'High-quality materials, expert fabrication and natural finishing for a surface that lasts.',
      p1t: 'Veneer selection', p1d: 'Choose from our curated veneer collection.',
      p2t: 'Panel fabrication', p2d: 'Veneer applied onto HMR or plywood with precision.',
      p3t: 'Natural finishing', p3d: 'Finished with water-based, food-grade hard oil wax.',
      processLink: 'See our services',
      videoTitleTop: 'A conversation', videoTitleBottom: 'from the workshop',
      videoDesc: 'A member of our workshop team shares a closer look at the craft behind KAIU veneer.',

            worksTitle1: 'Real Spaces,', worksTitle2: 'Real Stories',
      viewAllProjects: 'View all projects',

            ctaTitle: 'Tell us about the space',
      ctaDesc: "Whether it's a residential, commercial or hospitality project, we're here to help you find the perfect veneer solution.",
      ctaButton: 'Inquire now',
    },
    about: {
      title: 'More than a surface.',
      lede: 'We supply veneer to architects, designers, manufacturers and homeowners across Indonesia, and finish it ourselves when a project needs it.',

      materialTitle1: 'What our veneer', materialTitle2: 'actually is.',
      materialP1: 'Fast-growing timber is sliced, dyed all the way through, re-stacked into a block and sliced again. What comes out is real wood, with the variance engineered out.',
      materialP2: 'It is not a print and not a laminate. Sand it, rout it, mitre it: the colour and the grain run right through the leaf.',
      points: [
        ['01', 'Authentic wood aesthetics', 'Real timber, beautifully engineered, not a photographic reproduction.'],
        ['02', 'Consistent quality', 'Uniform grain and colour, sheet after sheet, order after order.'],
        ['03', 'Wide design options', '218 surfaces across six collections, including colours wood cannot grow.'],
        ['04', 'Durable and stable', 'No knots or splits to work around, so your joiner stops cutting around faults.'],
      ],

      whyTitle1: 'Craft, stock and', whyTitle2: 'follow-through.',
      why: [
        ['Curated selection', 'Six collections, each with a point of view, from pale Scandinavian oak to engineered pattern work.'],
        ['Reliable supply', 'Held in Jakarta, consistent at any scale, repeatable when you re-order years later.'],
        ['Trusted by professionals', 'Specified in residential, commercial and hospitality projects by design studios across Indonesia.'],
        ['End-to-end support', 'From material selection through fabrication to application guidance on site.'],
      ],

      specTitle: 'Written for the spec sheet',
      specCaption: 'Standard sheet, all collections',
      spec: [
        ['Length × width', '2500 × 640 mm · 2500 × 620 mm'],
        ['Thickness', '0.40 mm'],
        ['Services', 'Veneer supply · panel fabrication on HMR or plywood · natural finishing'],
      ],

      ctaTitle: 'Bring your vision to life.',
      ctaDesc: "Tell us the project and we'll send the sheets worth looking at.",
      ctaButton: 'Inquire now',
    },
    products: {
      title: 'Collections',
      toneLabel: 'Tone',
      tones: { all: 'All tones', light: 'Light', warm: 'Warm', cool: 'Cool', dark: 'Dark', colorful: 'Colorful' },
      searchLabel: 'Search', searchPlaceholder: 'oak, burl, sapphire…',
      resultOne: 'result', resultMany: 'results',
      empty: 'No veneer matches these filters.', reset: 'Clear filters', showMore: 'Show more veneers',
    },
    productDetail: {
      back: '← Back to Collections', collection: 'Collection', collectionOf: '{name} Collection', requestSample: 'Request a Sample',
      notFound: 'Product not found.', dimension: 'Dimension', downloadHiRes: 'Download Hi-Res',
      home: 'Home', collections: 'Collections',
      specCollection: 'Collection', specSize: 'Sheet size',
      specFinish: 'Finish', specBestFor: 'Best for',
      gallery: 'Product images', swatchThumb: 'Veneer sheet', roomThumb: 'Room view {n}',
      fullSheetTitle: 'The full sheet', fullSheetNote: 'One complete leaf at {size}, as it arrives. Download the original to use in your renders.',
      relatedTitle: 'More from {name}',
    },
    viewer: {
      open: 'View in Room', title: 'Room view', loading: 'Loading the room',
      error: 'The room view could not be loaded. Please try again.',
      prev: 'Previous angle', next: 'Next angle',
      angles: 'Camera angles', angle: 'Angle', fullscreen: 'Enter fullscreen', exitFullscreen: 'Exit fullscreen',
      backToSwatch: 'View veneer swatch',
    },
    projects: {
      title: 'Selected Work', title1: 'Real Spaces,', title2: 'Real Stories',
      intro: 'Explore spaces shaped by thoughtful design and veneer chosen to suit each setting.',
      explore: 'Explore projects', featured: 'Featured project',
      collectionTitle: 'Spaces made personal', filterLabel: 'Filter projects by type', all: 'All',
      collectionIntro: 'Explore completed spaces shaped by considered design and KAIU veneer. Each project brings texture, tone and material together with its own character.',
      projectCount: 'projects',
      types: { residential: 'Residential', commercial: 'Commercial', hospitality: 'Hospitality' },
      ctaEyebrow: 'Have a project in mind?', ctaTitle: "Let’s create it together", ctaButton: 'Contact our team',
    },
    projectDetail: {
      back: '← Back to Projects', space: 'Space', client: 'Client', location: 'Location',
      veneerUsed: 'Veneer Used', veneersUsed: 'Veneers Used',
      designer: 'Interior Designer', photo: 'photo', notFound: 'Project not found.',
    },
    services: {
      title: 'From veneer to finished surface',
      intro: 'Veneer supply, matching, pressing and finishing. What KAIU can take on between choosing a sheet and installing the surface.',
    },
    contact: {
      title: "Let's talk about your next surface",
      intro: 'Tell us about your project and the veneer you have in mind. Our team will be happy to help.',
      studio: 'Studio', email: 'Email', phone: 'Phone / WhatsApp', hours: 'Studio Hours',
      visit: 'Visit',
      hoursValue: 'Monday to Friday, 09:00 to 18:00',
      fullName: 'Full Name', fullNamePh: 'Your name',
      emailField: 'Email', emailPh: 'you@company.com',
      phoneField: 'Phone Number', phonePh: '+62 8xx xxxx xxxx', optional: 'optional',
      projectType: 'Project Type', projectTypePlaceholder: 'Choose a project type',
      projectTypes: { residential: 'Residential', commercial: 'Commercial', hospitality: 'Hospitality', office: 'Office', other: 'Other' },
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
        title: 'KAIU - Veneer Kayu',
        description: 'KAIU memasok veneer kayu alami premium untuk arsitek, desainer, produsen, dan pemilik rumah di Jakarta. Enam koleksi, dipotong dan dipasangkan sesuai pesanan.',
      },
      about: {
        title: 'Tentang KAIU - Lebih dari Sekadar Permukaan',
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
      tagline: 'Veneer premium untuk hunian modern. Dari pemilihan hingga permukaan jadi, kami wujudkan ide Anda.',
      explore: 'Jelajahi', studio: 'Studio', rights: 'Hak cipta dilindungi.',
      services: 'Layanan', serviceVeneer: 'Veneer kayu', servicePanel: 'Fabrikasi panel', serviceFinishing: 'Finishing alami',
    },
    home: {
            heroTitle1: 'Dari Visi', heroTitle2: 'ke Ruang Nyata',
      heroDesc: 'Veneer kayu premium yang menghadirkan keindahan alami, konsistensi, dan ketahanan pada setiap permukaan.',
      exploreProducts: 'Lihat produk', viewProjects: 'Lihat proyek',

      sectorResidential: 'Residensial', sectorCommercial: 'Komersial',
      sectorHospitality: 'Hospitality', sectorOffice: 'Perkantoran',
      sectorLink: 'Lihat proyek',

            materialTitle1: 'Veneer Kayu,', materialTitle2: 'Kemungkinan Tanpa Batas',
      materialDesc: 'Terbuat dari kayu asli, setiap veneer diiris, diberi warna, lalu dipres ulang agar pola seratnya konsisten di setiap lembar. Nikmati tampilan dan nuansa kayu alami dengan warna dan pola yang seragam.',
      m1t: 'Estetika kayu autentik', m1d: 'Kayu asli, direkayasa dengan indah',
      m2t: 'Kualitas konsisten', m2d: 'Serat dan warna yang seragam',
      m3t: 'Pilihan desain luas', m3d: 'Beragam tekstur dan nuansa warna',
      m4t: 'Awet dan stabil', m4d: 'Ideal untuk ruang hunian modern',
      exploreCollection: 'Lihat koleksi kami',
      sheetsLabel: 'Tujuh veneer kami, dari terang ke gelap',
      whyEyebrow: 'Mengapa KAIU', whyTitle: 'Lebih dari Sekadar Permukaan',
      whyDesc: 'Kami memadukan keterampilan, teknologi, dan desain untuk menghadirkan veneer bagi interior yang dirancang dengan cermat dan kebutuhan sehari hari.',
      w1t: 'Pilihan terkurasi', w1d: 'Beragam desain kayu modern',
      w2t: 'Pasokan andal', w2d: 'Kualitas konsisten untuk berbagai skala',
      w3t: 'Dipercaya para profesional', w3d: 'Untuk hunian, ruang komersial, dan hospitality',
      w4t: 'Dukungan menyeluruh', w4d: 'Panduan dari pemilihan material hingga penerapan',


            processTitle1: 'Apa yang kami kerjakan', processTitle2: 'dengan veneer',
      processDesc: 'Material berkualitas, fabrikasi ahli, dan finishing alami untuk permukaan yang tahan lama.',
      p1t: 'Pemilihan veneer', p1d: 'Pilih dari koleksi veneer pilihan kami.',
      p2t: 'Fabrikasi panel', p2d: 'Veneer diaplikasikan pada HMR atau plywood dengan presisi.',
      p3t: 'Finishing alami', p3d: 'Diselesaikan dengan hard oil wax berbahan air, food-grade.',
      processLink: 'Lihat layanan kami',
      videoTitleTop: 'Percakapan', videoTitleBottom: 'dari workshop',
      videoDesc: 'Anggota tim workshop kami berbagi cerita tentang keterampilan di balik veneer KAIU.',

            worksTitle1: 'Ruang Nyata,', worksTitle2: 'Cerita Nyata',
      viewAllProjects: 'Lihat semua proyek',

            ctaTitle: 'Ceritakan ruangan Anda',
      ctaDesc: 'Baik proyek residensial, komersial, maupun hospitality, kami siap membantu Anda menemukan solusi veneer yang tepat.',
      ctaButton: 'Hubungi kami',
    },
    about: {
      title: 'Lebih dari sekadar permukaan.',
      lede: 'Kami memasok veneer untuk arsitek, desainer, produsen, dan pemilik rumah di seluruh Indonesia, dan menyelesaikannya sendiri bila proyek membutuhkannya.',

      materialTitle1: 'Apa itu veneer kami', materialTitle2: 'sebenarnya.',
      materialP1: 'Kayu cepat tumbuh diiris, diwarnai hingga ke dalam, disusun kembali menjadi blok, lalu diiris lagi. Hasilnya kayu asli, dengan variasi alaminya direkayasa hilang.',
      materialP2: 'Ini bukan cetakan dan bukan laminasi. Diamplas, dirouter, atau dipotong miring: warna dan seratnya tetap menembus seluruh lembar.',
      points: [
        ['01', 'Estetika kayu autentik', 'Kayu asli yang direkayasa dengan indah, bukan reproduksi foto.'],
        ['02', 'Kualitas konsisten', 'Serat dan warna seragam, lembar demi lembar, pesanan demi pesanan.'],
        ['03', 'Pilihan desain luas', '218 permukaan dalam enam koleksi, termasuk warna yang tak bisa tumbuh di kayu.'],
        ['04', 'Awet dan stabil', 'Tanpa mata kayu atau retak, sehingga tukang Anda tak perlu menghindari cacat.'],
      ],

      whyTitle1: 'Keahlian, stok, dan', whyTitle2: 'tindak lanjut.',
      why: [
        ['Pilihan terkurasi', 'Enam koleksi, masing-masing dengan karakternya, dari oak Skandinavia pucat hingga pola rekayasa.'],
        ['Pasokan andal', 'Tersedia di Jakarta, konsisten pada skala apa pun, dapat diulang saat Anda memesan lagi bertahun kemudian.'],
        ['Dipercaya profesional', 'Digunakan pada proyek residensial, komersial, dan hospitality oleh studio desain di seluruh Indonesia.'],
        ['Dukungan menyeluruh', 'Dari pemilihan material, fabrikasi, hingga panduan aplikasi di lokasi.'],
      ],

      specTitle: 'Ditulis untuk lembar spesifikasi',
      specCaption: 'Lembar standar, semua koleksi',
      spec: [
        ['Panjang × lebar', '2500 × 640 mm · 2500 × 620 mm'],
        ['Ketebalan', '0,40 mm'],
        ['Layanan', 'Pasokan veneer · fabrikasi panel pada HMR atau plywood · finishing alami'],
      ],

      ctaTitle: 'Wujudkan visi Anda.',
      ctaDesc: 'Ceritakan proyek Anda dan kami kirimkan lembar yang layak dilihat.',
      ctaButton: 'Hubungi kami',
    },
    products: {
      title: 'Koleksi',
      toneLabel: 'Nuansa',
      tones: { all: 'Semua nuansa', light: 'Terang', warm: 'Hangat', cool: 'Sejuk', dark: 'Gelap', colorful: 'Berwarna' },
      searchLabel: 'Cari', searchPlaceholder: 'oak, burl, sapphire…',
      resultOne: 'hasil', resultMany: 'hasil',
      empty: 'Tidak ada veneer yang cocok dengan filter ini.', reset: 'Hapus filter', showMore: 'Tampilkan lebih banyak',
    },
    productDetail: {
      back: '← Kembali ke Koleksi', collection: 'Koleksi', collectionOf: 'Koleksi {name}', requestSample: 'Minta Sampel',
      notFound: 'Produk tidak ditemukan.', dimension: 'Dimensi', downloadHiRes: 'Unduh Resolusi Tinggi',
      home: 'Beranda', collections: 'Koleksi',
      specCollection: 'Koleksi', specSize: 'Ukuran lembar',
      specFinish: 'Finishing', specBestFor: 'Cocok untuk',
      gallery: 'Gambar produk', swatchThumb: 'Lembar veneer', roomThumb: 'Tampilan ruangan {n}',
      fullSheetTitle: 'Lembar utuh', fullSheetNote: 'Satu lembar utuh berukuran {size}, apa adanya. Unduh file aslinya untuk render Anda.',
      relatedTitle: 'Lainnya dari {name}',
    },
    viewer: {
      open: 'Lihat di Ruangan', title: 'Tampilan ruangan', loading: 'Memuat ruangan',
      error: 'Tampilan ruangan tidak dapat dimuat. Silakan coba lagi.',
      prev: 'Sudut sebelumnya', next: 'Sudut berikutnya',
      angles: 'Sudut kamera', angle: 'Sudut', fullscreen: 'Layar penuh', exitFullscreen: 'Keluar layar penuh',
      backToSwatch: 'Lihat sampel veneer',
    },
    projects: {
      title: 'Karya Pilihan', title1: 'Ruang Nyata,', title2: 'Cerita Nyata',
      intro: 'Jelajahi ruang yang dibentuk oleh desain cermat dan veneer pilihan untuk setiap kebutuhan.',
      explore: 'Jelajahi proyek', featured: 'Proyek pilihan',
      collectionTitle: 'Ruang yang terasa personal', filterLabel: 'Filter proyek berdasarkan jenis', all: 'Semua',
      collectionIntro: 'Jelajahi ruang yang ditata dengan desain cermat dan veneer KAIU. Setiap proyek memadukan tekstur, warna, dan material dengan karakter tersendiri.',
      projectCount: 'proyek',
      types: { residential: 'Hunian', commercial: 'Komersial', hospitality: 'Hospitality' },
      ctaEyebrow: 'Punya proyek yang sedang direncanakan?', ctaTitle: 'Mari wujudkan bersama', ctaButton: 'Hubungi tim kami',
    },
    projectDetail: {
      back: '← Kembali ke Proyek', space: 'Ruang', client: 'Klien', location: 'Lokasi',
      veneerUsed: 'Veneer Digunakan', veneersUsed: 'Veneer Digunakan',
      designer: 'Desainer Interior', photo: 'foto', notFound: 'Proyek tidak ditemukan.',
    },
    services: {
      title: 'Dari veneer ke permukaan jadi',
      intro: 'Penyediaan veneer, pencocokan, pengepresan, dan finishing. Apa yang dapat KAIU kerjakan antara memilih lembaran dan memasang permukaannya.',
    },
    contact: {
      title: 'Mari bicarakan permukaan berikutnya',
      intro: 'Ceritakan proyek dan veneer yang Anda cari. Tim kami siap membantu.',
      studio: 'Studio', email: 'Email', phone: 'Telepon / WhatsApp', hours: 'Jam Operasional',
      visit: 'Kunjungi',
      hoursValue: 'Senin sampai Jumat, 09:00 sampai 18:00',
      fullName: 'Nama Lengkap', fullNamePh: 'Nama Anda',
      emailField: 'Email', emailPh: 'anda@perusahaan.com',
      phoneField: 'Nomor Telepon', phonePh: '+62 8xx xxxx xxxx', optional: 'opsional',
      projectType: 'Jenis Proyek', projectTypePlaceholder: 'Pilih jenis proyek',
      projectTypes: { residential: 'Residensial', commercial: 'Komersial', hospitality: 'Hospitality', office: 'Perkantoran', other: 'Lainnya' },
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
