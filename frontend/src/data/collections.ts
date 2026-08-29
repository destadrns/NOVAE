export interface Collection {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  detailImage: string;
  accentQuote: string;
  productCount: number;
  featuredSlug: string;
  materialSpec: string;
  silhouetteSpec: string;
  paletteSpec: string;
  location: string;
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'form',
    code: '01',
    name: 'FORM',
    tagline: 'Structured silhouettes.',
    description: 'An architectural exploration of volume, strict clean geometries, and deliberate drape. Tailored with heavyweight double-face wools and high-density twills.',
    heroImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1400&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    accentQuote: 'Structure is not constraint. It is clarity.',
    productCount: 8,
    featuredSlug: 'oversized-form-jacket',
    materialSpec: 'Double-Face Recycled Wool & 450 GSM Twill',
    silhouetteSpec: 'Architectural Boxy / Deep Front Pleats',
    paletteSpec: 'Pitch Obsidian • Raw Stone • Slate',
    location: 'MILAN ATELIER // ARCHIVE 01'
  },
  {
    id: 'motion',
    code: '02',
    name: 'MOTION',
    tagline: 'Designed for movement.',
    description: 'Fluidity in kinetic cadence. Fabrics selected for their dynamic flow in air, natural folds during stride, and effortless transition across environments.',
    heroImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    accentQuote: 'The garment lives only when the body moves.',
    productCount: 6,
    featuredSlug: 'fluid-motion-kimono-shirt',
    materialSpec: 'Sandwashed Eco-Cupro & Silk Blend',
    silhouetteSpec: 'Dynamic Wrap / Split Cuffs / Kinetic Flow',
    paletteSpec: 'Bone Off-White • Charcoal Shadow',
    location: 'TOKYO MOVEMENT LAB // CADENCE 02'
  },
  {
    id: 'identity',
    code: '03',
    name: 'IDENTITY',
    tagline: 'Made to express.',
    description: 'Raw edge details, modular fastenings, and unconventional proportions. Pieces that stand outside seasonal trend cycles to articulate personal presence.',
    heroImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1400&auto=format&fit=crop',
    detailImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
    accentQuote: 'Wear the unexpected. Define your own form.',
    productCount: 7,
    featuredSlug: 'identity-raw-trench-coat',
    materialSpec: 'Japanese Heavy Cotton Gabardine Canvas',
    silhouetteSpec: 'Raw Cut Hem / Extended Trench Collar',
    paletteSpec: 'Obsidian Black • Earth Umber • Raw Sand',
    location: 'JAKARTA ATELIER // EDITION 03'
  }
];
