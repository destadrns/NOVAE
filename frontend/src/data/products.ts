export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  category: 'Outerwear' | 'Tops' | 'Bottoms' | 'Accessories';
  collection: 'FORM' | 'MOTION' | 'IDENTITY';
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  details: {
    material: string;
    fit: string;
    care: string;
    origin: string;
  };
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'OVERSIZED FORM JACKET',
    slug: 'oversized-form-jacket',
    tagline: 'Architectural boxy silhouette in structured double-face technical wool.',
    description: 'The cornerstone of our FORM series. Engineered with dropped shoulders, an asymmetric concealed storm flap, and a crisp, heavyweight drape that holds its architectural line in any posture.',
    price: 899000,
    category: 'Outerwear',
    collection: 'FORM',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' },
      { name: 'Raw Stone', hex: '#D8D4CC' },
      { name: 'Muted Slate', hex: '#3B3D40' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 24,
    tags: ['minimal', 'oversized', 'structured', 'monochrome', 'outerwear'],
    featured: true,
    newArrival: true,
    details: {
      material: '70% Italian Recycled Wool, 30% Tech Polyamide',
      fit: 'Relaxed sculptural oversized fit',
      care: 'Dry clean only. Do not tumble dry.',
      origin: 'Crafted in Bandung Atelier'
    }
  },
  {
    id: 'prod-02',
    name: 'SCULPTED TAILORED TROUSER',
    slug: 'sculpted-tailored-trouser',
    tagline: 'Deep front pleats transitioning into a fluid, wide-leg profile.',
    description: 'Precision-tailored trousers balancing classic bespoke proportion with contemporary brutalist lines. Featuring an internal drawstring cinch and invisible cuff hem.',
    price: 649000,
    category: 'Bottoms',
    collection: 'FORM',
    images: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' },
      { name: 'Bone White', hex: '#F5F3EF' }
    ],
    sizes: ['28', '30', '32', '34'],
    stock: 18,
    tags: ['minimal', 'structured', 'classic', 'monochrome', 'bottoms'],
    featured: true,
    newArrival: true,
    details: {
      material: '100% High-Density Tencel Twill',
      fit: 'High-waisted wide drape',
      care: 'Machine wash cold delicate. Hang dry.',
      origin: 'Crafted in Bandung Atelier'
    }
  },
  {
    id: 'prod-03',
    name: 'FLUID MOTION KIMONO SHIRT',
    slug: 'fluid-motion-kimono-shirt',
    tagline: 'Dynamic cross-over closure designed for unrestricted flow.',
    description: 'Constructed from lightweight sand-washed cupro that catches wind with natural grace. Features minimal ribbon tie fastenings and extended split cuffs.',
    price: 589000,
    category: 'Tops',
    collection: 'MOTION',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Bone Off-White', hex: '#F5F3EF' },
      { name: 'Charcoal Shadow', hex: '#191919' }
    ],
    sizes: ['S', 'M', 'L'],
    stock: 15,
    tags: ['relaxed', 'flow', 'avant-garde', 'neutral', 'tops'],
    featured: true,
    newArrival: false,
    details: {
      material: '100% Sandwashed Eco-Cupro',
      fit: 'Relaxed fluid fit with wrap closure',
      care: 'Hand wash cool. Steam low.',
      origin: 'Crafted in Jakarta Studio'
    }
  },
  {
    id: 'prod-04',
    name: 'IDENTITY RAW TRENCH COAT',
    slug: 'identity-raw-trench-coat',
    tagline: 'Unlined storm-proof cotton canvas with raw cut-edge finishing.',
    description: 'An unapologetic statement piece. Features an elongated silhouette extending past the calf, exaggerated storm collar, and a modular magnetic belt fastening system.',
    price: 1299000,
    category: 'Outerwear',
    collection: 'IDENTITY',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Pitch Obsidian', hex: '#0A0A0A' },
      { name: 'Earth Umber', hex: '#4A3B32' }
    ],
    sizes: ['M', 'L', 'XL'],
    stock: 8,
    tags: ['avant-garde', 'oversized', 'bold', 'earth', 'outerwear'],
    featured: true,
    newArrival: true,
    details: {
      material: 'Water-Repellent Japanese Gabardine Cotton',
      fit: 'Full-length sculptural drape',
      care: 'Spot clean or specialist dry clean.',
      origin: 'Limited Run — 50 Pieces'
    }
  },
  {
    id: 'prod-05',
    name: 'MINIMAL CROPPED HOODIE',
    slug: 'minimal-cropped-hoodie',
    tagline: '500 GSM heavyweight organic French terry with zero external branding.',
    description: 'Clean architectural geometry in pure luxury cotton. Double-layered hood that sits upright, seamless kangaroo pocket entry, and ribbed ergonomic hem.',
    price: 529000,
    category: 'Tops',
    collection: 'MOTION',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=1200&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Washed Ash', hex: '#303030' },
      { name: 'Pure Bone', hex: '#F5F3EF' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30,
    tags: ['street', 'minimal', 'regular', 'monochrome', 'tops'],
    featured: false,
    newArrival: true,
    details: {
      material: '100% GOTS Organic Cotton (500 GSM)',
      fit: 'Boxy crop with ergonomic sleeve contour',
      care: 'Machine wash cold. Lay flat to dry.',
      origin: 'Crafted in Bandung Atelier'
    }
  },
  {
    id: 'prod-06',
    name: 'STRUCTURED CANVAS TOTE',
    slug: 'structured-canvas-tote',
    tagline: 'Brutalist heavy-duty accessory with ballistic nylon reinforcement.',
    description: 'Engineered for daily transport with internal padded laptop compartment, waterproof zipper pockets, and matte black anodized hardware.',
    price: 349000,
    category: 'Accessories',
    collection: 'IDENTITY',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' },
      { name: 'Raw Sand', hex: '#C2BCB2' }
    ],
    sizes: ['ONE SIZE'],
    stock: 45,
    tags: ['minimal', 'structured', 'monochrome', 'accessories'],
    featured: false,
    newArrival: false,
    details: {
      material: '24oz Industrial Cotton Canvas & Matte Hardware',
      fit: '28L capacity with 16" laptop sleeve',
      care: 'Wipe clean with damp cloth.',
      origin: 'Crafted in Jakarta Studio'
    }
  }
];
