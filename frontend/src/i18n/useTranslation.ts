import { useLanguageStore } from '@/store/useLanguageStore';
import { translations } from './translations';
import { Product } from '@/data/products';
import { Collection } from '@/data/collections';
import { Article } from '@/data/articles';

// Localized product details mapping
const PRODUCT_LOCALIZATIONS: Record<string, {
  id: {
    tagline: string;
    description: string;
    material: string;
    fit: string;
    care: string;
    origin: string;
  };
}> = {
  'prod-01': {
    id: {
      tagline: 'Siluet boxy arsitektural dalam bahan wol teknikal double-face terstruktur.',
      description: 'Fondasi utama dari seri FORM kami. Direkayasa dengan bahu jatuh, storm flap tersembunyi asimetris, dan drape berbobot tegas yang mempertahankan garis arsitekturalnya di setiap postur tubuh.',
      material: '70% Wol Daur Ulang Italia, 30% Poliamida Teknikal',
      fit: 'Fit oversized skulptural yang santai',
      care: 'Cuci kering (dry clean) saja. Jangan gunakan mesin pengering.',
      origin: 'Dibuat di Bandung Atelier'
    }
  },
  'prod-02': {
    id: {
      tagline: 'Lipatan pleats depan bertransisi menjadi siluet kaki lebar yang mengalir.',
      description: 'Celana berpotongan presisi yang menyeimbangkan proporsi klasik bespoke dengan garis brutalis kontemporer. Dilengkapi tali serut internal dan keliman ujung celana tak terlihat.',
      material: '100% Tencel Twill Berdensitas Tinggi',
      fit: 'Drape lebar dengan pinggang tinggi',
      care: 'Cuci mesin air dingin mode halus. Gantung hingga kering.',
      origin: 'Dibuat di Bandung Atelier'
    }
  },
  'prod-03': {
    id: {
      tagline: 'Penutup silang dinamis yang dirancang untuk kebebasan gerak tanpa hambatan.',
      description: 'Dibuat dari kain cupro sand-washed ringan yang menangkap angin dengan keanggunan alami. Menampilkan pengikat pita minimalis dan manset belah yang diperpanjang.',
      material: '100% Eco-Cupro Sandwashed',
      fit: 'Fit rileks fluida dengan penutup silang (wrap)',
      care: 'Cuci tangan dengan air dingin. Setrika uap suhu rendah.',
      origin: 'Dibuat di Jakarta Studio'
    }
  },
  'prod-04': {
    id: {
      tagline: 'Kanvas katun tahan badai tanpa furing dengan sentuhan tepi potongan raw-cut.',
      description: 'Sebuah busana pernyataan yang berani. Menampilkan siluet panjang melampaui betis, kerah badai yang dieksagerasi, dan sistem pengencang sabuk magnetik modular.',
      material: 'Katun Gabardine Jepang Anti Air',
      fit: 'Drape skulptural panjang penuh',
      care: 'Bersihkan noda secara lokal atau dry clean spesialis.',
      origin: 'Dibuat di Bandung Atelier // Edisi 50 Piece'
    }
  },
  'prod-05': {
    id: {
      tagline: 'French terry katun organik 500 GSM berdensitas tinggi tanpa ornamen eksternal.',
      description: 'Geometri arsitektural bersih dalam katun mewah murni. Tudung kepala berlapis ganda yang berdiri tegak, saku kanguru tanpa sambungan, dan keliman rib ergonomis.',
      material: '100% Katun Organik Bersertifikat GOTS (500 GSM)',
      fit: 'Potongan crop boxy dengan kontur lengan ergonomis',
      care: 'Cuci mesin dengan air dingin. Baringkan mendatar hingga kering.',
      origin: 'Dibuat di Bandung Atelier'
    }
  },
  'prod-06': {
    id: {
      tagline: 'Aksesori brutalist berdaya tahan tinggi dengan penguatan nilon balistik.',
      description: 'Dirancang untuk mobilitas harian dengan kompartemen laptop berlapis busa internal, saku ritsleting tahan air, dan perangkat keras logam anodisasi hitam matte.',
      material: 'Kanvas Katun Industri 24oz & Logam Hitam Matte',
      fit: 'Kapasitas 28L dengan kompartemen laptop 16"',
      care: 'Usap bersih dengan kain lembap.',
      origin: 'Dibuat di Jakarta Studio'
    }
  }
};

const COLLECTION_LOCALIZATIONS: Record<string, {
  id: {
    tagline: string;
    description: string;
    accentQuote: string;
    materialSpec: string;
    silhouetteSpec: string;
    paletteSpec: string;
  };
}> = {
  form: {
    id: {
      tagline: 'Siluet terstruktur.',
      description: 'Eksplorasi arsitektural tentang volume, geometri bersih yang tegas, dan drape terencana. Disesuaikan dengan wol double-face berbobot berat dan twill berdensitas tinggi.',
      accentQuote: 'Struktur bukanlah kekangan. Struktur adalah kejernihan.',
      materialSpec: 'Wol Daur Ulang Double-Face & 450 GSM Twill',
      silhouetteSpec: 'Boxy Arsitektural / Lipatan Pleats Depan Dalam',
      paletteSpec: 'Pitch Obsidian • Raw Stone • Slate'
    }
  },
  motion: {
    id: {
      tagline: 'Didesain untuk gerakan.',
      description: 'Kelenturan dalam ritme kinetik. Kain dipilih untuk aliran dinamisnya saat tertiup angin, lipatan alami saat melangkah, dan transisi mulus di berbagai lingkungan.',
      accentQuote: 'Pakaian baru benar-benar hidup saat tubuh bergerak.',
      materialSpec: 'Paduan Eco-Cupro Sandwashed & Sutra',
      silhouetteSpec: 'Wrap Dinamis / Belahan Manset / Aliran Kinetik',
      paletteSpec: 'Bone Off-White • Charcoal Shadow'
    }
  },
  identity: {
    id: {
      tagline: 'Dibuat untuk ekspresi.',
      description: 'Detail tepian raw cut, pengencang modular, dan proporsi nonkonvensional. Busana yang berdiri di luar siklus tren musiman untuk menegaskan kehadiran personal.',
      accentQuote: 'WEAR THE UNEXPECTED. Tentukan bentuk Anda sendiri.',
      materialSpec: 'Kanvas Katun Gabardine Jepang Berdensitas Tinggi',
      silhouetteSpec: 'Keliman Raw Cut / Kerah Mantel Trench Panjang',
      paletteSpec: 'Obsidian Black • Earth Umber • Raw Sand'
    }
  }
};

const ARTICLE_LOCALIZATIONS: Record<string, {
  id: {
    title: string;
    excerpt: string;
    readTime: string;
    date: string;
  };
}> = {
  'art-01': {
    id: {
      title: 'Seni Memakai Lebih Sedikit',
      excerpt: 'Mendekonstruksi tumpukan lemari pakaian modern. Bagaimana berpakaian reduktif membuka kehadiran personal yang lebih tajam tanpa kompromi estetika.',
      readTime: 'BACA 4 MENIT',
      date: 'OKTOBER 2026'
    }
  },
  'art-02': {
    id: {
      title: 'Mengapa Siluet Menjadi Kunci',
      excerpt: 'Sebelum warna atau kain, mata manusia terlebih dahulu membaca siluet. Eksplorasi siluet arsitektural brutalis dalam estetika kontemporer.',
      readTime: 'BACA 6 MENIT',
      date: 'SEPTEMBER 2026'
    }
  },
  'art-03': {
    id: {
      title: 'Di Balik Layar NOVAÉ: FORM 01',
      excerpt: 'Melihat lebih dekat proses perancangan pola, kurasi material, dan pengujian prototipe untuk rilis kapsul struktural perdana kami.',
      readTime: 'BACA 5 MENIT',
      date: 'AGUSTUS 2026'
    }
  }
};

export const useTranslation = () => {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();
  const t = translations[language];

  const getLocalizedProduct = (product: Product): Product => {
    if (!product) return product;
    if (language === 'en') return product;
    const loc = PRODUCT_LOCALIZATIONS[product.id]?.id;
    if (!loc) return product;

    return {
      ...product,
      tagline: product.tagline || loc.tagline,
      description: product.description || loc.description,
      details: {
        ...product.details,
        material: product.details?.material || loc.material,
        fit: product.details?.fit || loc.fit,
        care: product.details?.care || loc.care,
        origin: product.details?.origin || loc.origin,
      },
    };
  };

  const getLocalizedCollection = (collection: Collection): Collection => {
    if (!collection) return collection;
    if (language === 'en') return collection;
    const loc = COLLECTION_LOCALIZATIONS[collection.id]?.id;
    if (!loc) return collection;

    return {
      ...collection,
      tagline: collection.tagline || loc.tagline,
      description: collection.description || loc.description,
      accentQuote: collection.accentQuote || loc.accentQuote,
      materialSpec: collection.materialSpec || loc.materialSpec,
      silhouetteSpec: collection.silhouetteSpec || loc.silhouetteSpec,
      paletteSpec: collection.paletteSpec || loc.paletteSpec,
    };
  };

  const getLocalizedArticle = (article: Article): Article => {
    if (language === 'en') return article;
    const loc = ARTICLE_LOCALIZATIONS[article.id]?.id;
    if (!loc) return article;

    return {
      ...article,
      title: loc.title || article.title,
      excerpt: loc.excerpt || article.excerpt,
      readTime: loc.readTime || article.readTime,
      date: loc.date || article.date,
    };
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
    getLocalizedProduct,
    getLocalizedCollection,
    getLocalizedArticle,
  };
};
