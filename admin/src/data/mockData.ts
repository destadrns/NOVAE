import {
  AdminProduct,
  AdminOrder,
  AdminCustomer,
  InventoryItem,
  DashboardMetrics,
  SalesDataPoint,
} from '@/types';

export const MOCK_PRODUCTS: AdminProduct[] = [
  {
    id: 'prod-01',
    name: 'OVERSIZED FORM JACKET',
    slug: 'oversized-form-jacket',
    tagline: 'Architectural boxy silhouette in structured double-face technical wool.',
    description: 'The cornerstone of our FORM series. Engineered with dropped shoulders, an asymmetric concealed storm flap, and a crisp, heavyweight drape.',
    price: 899000,
    category: 'Outerwear',
    collection: 'FORM',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' },
      { name: 'Raw Stone', hex: '#D8D4CC' },
      { name: 'Muted Slate', hex: '#3B3D40' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    totalStock: 24,
    variants: [
      { id: 'v-01-s', sku: 'NOV-FRM-01-BLK-S', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'S', stock: 4, lowStockThreshold: 3 },
      { id: 'v-01-m', sku: 'NOV-FRM-01-BLK-M', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'M', stock: 8, lowStockThreshold: 3 },
      { id: 'v-01-l', sku: 'NOV-FRM-01-BLK-L', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'L', stock: 2, lowStockThreshold: 3 },
      { id: 'v-01-xl', sku: 'NOV-FRM-01-BLK-XL', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'XL', stock: 10, lowStockThreshold: 3 },
    ],
    tags: ['minimal', 'oversized', 'structured', 'monochrome', 'outerwear'],
    featured: true,
    newArrival: true,
    status: 'PUBLISHED',
    createdAt: '2026-08-01T10:00:00Z',
    details: {
      material: '70% Italian Recycled Wool, 30% Tech Polyamide',
      fit: 'Relaxed sculptural oversized fit',
      care: 'Dry clean only. Do not tumble dry.',
      origin: 'Bandung Atelier'
    }
  },
  {
    id: 'prod-02',
    name: 'SCULPTED TAILORED TROUSER',
    slug: 'sculpted-tailored-trouser',
    tagline: 'Deep front pleats transitioning into a fluid, wide-leg profile.',
    description: 'Precision-tailored trousers balancing bespoke proportion with brutalist lines.',
    price: 649000,
    category: 'Bottoms',
    collection: 'FORM',
    images: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' },
      { name: 'Bone White', hex: '#F5F3EF' }
    ],
    sizes: ['28', '30', '32', '34'],
    totalStock: 18,
    variants: [
      { id: 'v-02-28', sku: 'NOV-FRM-02-BLK-28', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: '28', stock: 2, lowStockThreshold: 3 },
      { id: 'v-02-30', sku: 'NOV-FRM-02-BLK-30', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: '30', stock: 6, lowStockThreshold: 3 },
      { id: 'v-02-32', sku: 'NOV-FRM-02-BLK-32', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: '32', stock: 7, lowStockThreshold: 3 },
      { id: 'v-02-34', sku: 'NOV-FRM-02-BLK-34', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: '34', stock: 3, lowStockThreshold: 3 },
    ],
    tags: ['minimal', 'structured', 'classic', 'bottoms'],
    featured: true,
    newArrival: true,
    status: 'PUBLISHED',
    createdAt: '2026-08-05T11:30:00Z',
    details: {
      material: '100% High-Density Tencel Twill',
      fit: 'High-waisted wide drape',
      care: 'Machine wash cold delicate. Hang dry.',
      origin: 'Bandung Atelier'
    }
  },
  {
    id: 'prod-03',
    name: 'FLUID MOTION KIMONO SHIRT',
    slug: 'fluid-motion-kimono-shirt',
    tagline: 'Dynamic cross-over closure designed for unrestricted flow.',
    description: 'Constructed from lightweight sand-washed cupro that catches wind with natural grace.',
    price: 589000,
    category: 'Tops',
    collection: 'MOTION',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Bone Off-White', hex: '#F5F3EF' },
      { name: 'Charcoal Shadow', hex: '#191919' }
    ],
    sizes: ['S', 'M', 'L'],
    totalStock: 15,
    variants: [
      { id: 'v-03-s', sku: 'NOV-MOT-03-BNE-S', colorName: 'Bone Off-White', colorHex: '#F5F3EF', size: 'S', stock: 3, lowStockThreshold: 3 },
      { id: 'v-03-m', sku: 'NOV-MOT-03-BNE-M', colorName: 'Bone Off-White', colorHex: '#F5F3EF', size: 'M', stock: 8, lowStockThreshold: 3 },
      { id: 'v-03-l', sku: 'NOV-MOT-03-BNE-L', colorName: 'Bone Off-White', colorHex: '#F5F3EF', size: 'L', stock: 4, lowStockThreshold: 3 },
    ],
    tags: ['relaxed', 'flow', 'avant-garde', 'tops'],
    featured: true,
    newArrival: false,
    status: 'PUBLISHED',
    createdAt: '2026-08-10T09:15:00Z',
    details: {
      material: '100% Sandwashed Eco-Cupro',
      fit: 'Relaxed fluid fit with wrap closure',
      care: 'Hand wash cool. Steam low.',
      origin: 'Jakarta Studio'
    }
  },
  {
    id: 'prod-04',
    name: 'IDENTITY RAW TRENCH COAT',
    slug: 'identity-raw-trench-coat',
    tagline: 'Unlined storm-proof cotton canvas with raw cut-edge finishing.',
    description: 'An unapologetic statement piece with exaggerated collar and magnetic belt fastening.',
    price: 1199000,
    category: 'Outerwear',
    collection: 'IDENTITY',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' },
      { name: 'Earth Umber', hex: '#4A3B32' }
    ],
    sizes: ['M', 'L'],
    totalStock: 8,
    variants: [
      { id: 'v-04-m', sku: 'NOV-IDN-04-BLK-M', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'M', stock: 5, lowStockThreshold: 2 },
      { id: 'v-04-l', sku: 'NOV-IDN-04-BLK-L', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'L', stock: 3, lowStockThreshold: 2 },
    ],
    tags: ['avant-garde', 'trench', 'waterproof', 'outerwear'],
    featured: true,
    newArrival: true,
    status: 'PUBLISHED',
    createdAt: '2026-08-12T14:20:00Z',
    details: {
      material: 'Japanese Waterproof Gabardine Cotton',
      fit: 'Full-length sculptural drape',
      care: 'Spot clean or dry clean only.',
      origin: 'Bandung Atelier // Numbered Edition'
    }
  },
  {
    id: 'prod-05',
    name: 'MINIMAL BOXY HOODIE',
    slug: 'minimal-boxy-hoodie',
    tagline: 'Heavyweight 500 GSM organic French terry with zero external branding.',
    description: 'Clean architectural geometry in heavyweight pure luxury cotton.',
    price: 499000,
    category: 'Tops',
    collection: 'IDENTITY',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' },
      { name: 'Muted Slate', hex: '#3B3D40' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    totalStock: 22,
    variants: [
      { id: 'v-05-s', sku: 'NOV-IDN-05-BLK-S', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'S', stock: 4, lowStockThreshold: 3 },
      { id: 'v-05-m', sku: 'NOV-IDN-05-BLK-M', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'M', stock: 9, lowStockThreshold: 3 },
      { id: 'v-05-l', sku: 'NOV-IDN-05-BLK-L', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'L', stock: 7, lowStockThreshold: 3 },
      { id: 'v-05-xl', sku: 'NOV-IDN-05-BLK-XL', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'XL', stock: 2, lowStockThreshold: 3 },
    ],
    tags: ['street', 'minimal', 'heavyweight', 'tops'],
    featured: false,
    newArrival: false,
    status: 'PUBLISHED',
    createdAt: '2026-08-15T16:00:00Z',
    details: {
      material: '100% GOTS Organic Cotton (500 GSM)',
      fit: 'Cropped boxy with ergonomic sleeve contour',
      care: 'Machine wash cold. Lay flat to dry.',
      origin: 'Bandung Atelier'
    }
  },
  {
    id: 'prod-06',
    name: 'ATELIER MODULAR TOTE',
    slug: 'atelier-modular-tote',
    tagline: 'High-durability brutalist accessory with ballistic nylon reinforcement.',
    description: 'Engineered for daily urban utility with padded internal laptop sleeve.',
    price: 349000,
    category: 'Accessories',
    collection: 'MOTION',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' }
    ],
    sizes: ['ONE SIZE'],
    totalStock: 12,
    variants: [
      { id: 'v-06-os', sku: 'NOV-MOT-06-BLK-OS', colorName: 'Obsidian Black', colorHex: '#0A0A0A', size: 'ONE SIZE', stock: 12, lowStockThreshold: 4 }
    ],
    tags: ['accessories', 'utility', 'tote'],
    featured: false,
    newArrival: false,
    status: 'PUBLISHED',
    createdAt: '2026-08-18T12:00:00Z',
    details: {
      material: '24oz Industrial Cotton Canvas & Matte Black Hardware',
      fit: '28L Capacity with 16" Laptop Compartment',
      care: 'Wipe clean with damp cloth.',
      origin: 'Jakarta Studio'
    }
  }
];

export const MOCK_ORDERS: AdminOrder[] = [
  {
    id: 'ord-01',
    orderNumber: 'NOV-2026-0108',
    customerName: 'Aria Wirasasmita',
    customerEmail: 'aria.wirasasmita@example.com',
    customerPhone: '+62 812-3456-7890',
    shippingCity: 'Jakarta Selatan',
    shippingAddress: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, 12190',
    items: [
      {
        productId: 'prod-01',
        productName: 'OVERSIZED FORM JACKET',
        productImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400&auto=format&fit=crop',
        color: 'Obsidian Black',
        size: 'L',
        quantity: 1,
        unitPrice: 899000,
        totalPrice: 899000
      },
      {
        productId: 'prod-02',
        productName: 'SCULPTED TAILORED TROUSER',
        productImage: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=400&auto=format&fit=crop',
        color: 'Obsidian Black',
        size: '32',
        quantity: 1,
        unitPrice: 649000,
        totalPrice: 649000
      }
    ],
    subtotal: 1548000,
    shippingFee: 0,
    totalAmount: 1548000,
    paymentMethod: 'VA_BCA',
    status: 'PAID',
    createdAt: '2026-08-29T08:45:00Z',
    trackingNumber: 'JNE-EXP-88392019'
  },
  {
    id: 'ord-02',
    orderNumber: 'NOV-2026-0107',
    customerName: 'Dimas Prasetyo',
    customerEmail: 'dimas.prasetyo@atelier.id',
    customerPhone: '+62 811-9988-7766',
    shippingCity: 'Bandung',
    shippingAddress: 'Jl. Dago Asri No. 18, Coblong, Bandung, 40135',
    items: [
      {
        productId: 'prod-04',
        productName: 'IDENTITY RAW TRENCH COAT',
        productImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400&auto=format&fit=crop',
        color: 'Obsidian Black',
        size: 'M',
        quantity: 1,
        unitPrice: 1199000,
        totalPrice: 1199000
      }
    ],
    subtotal: 1199000,
    shippingFee: 0,
    totalAmount: 1199000,
    paymentMethod: 'QRIS',
    status: 'PROCESSING',
    createdAt: '2026-08-29T07:20:00Z',
  },
  {
    id: 'ord-03',
    orderNumber: 'NOV-2026-0106',
    customerName: 'Nadia Sastrowardoyo',
    customerEmail: 'nadia.s@studio.co.id',
    customerPhone: '+62 813-2233-4455',
    shippingCity: 'Surabaya',
    shippingAddress: 'Jl. Raya Darmo Permai III No. 8, Dukuh Pakis, Surabaya, 60226',
    items: [
      {
        productId: 'prod-03',
        productName: 'FLUID MOTION KIMONO SHIRT',
        productImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop',
        color: 'Bone Off-White',
        size: 'M',
        quantity: 1,
        unitPrice: 589000,
        totalPrice: 589000
      }
    ],
    subtotal: 589000,
    shippingFee: 35000,
    totalAmount: 624000,
    paymentMethod: 'CREDIT_CARD',
    status: 'SHIPPED',
    createdAt: '2026-08-28T16:10:00Z',
    trackingNumber: 'SICEPAT-BEST-9920193'
  },
  {
    id: 'ord-04',
    orderNumber: 'NOV-2026-0105',
    customerName: 'Reza Rahardian',
    customerEmail: 'reza.rahardian@creative.id',
    customerPhone: '+62 817-4455-6677',
    shippingCity: 'Denpasar',
    shippingAddress: 'Jl. Pantai Batu Bolong No. 55, Canggu, Kuta Utara, Badung, Bali, 80351',
    items: [
      {
        productId: 'prod-05',
        productName: 'MINIMAL BOXY HOODIE',
        productImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop',
        color: 'Obsidian Black',
        size: 'L',
        quantity: 2,
        unitPrice: 499000,
        totalPrice: 998000
      }
    ],
    subtotal: 998000,
    shippingFee: 0,
    totalAmount: 998000,
    paymentMethod: 'VA_BCA',
    status: 'DELIVERED',
    createdAt: '2026-08-27T11:05:00Z',
    trackingNumber: 'JNE-YES-77291038'
  },
  {
    id: 'ord-05',
    orderNumber: 'NOV-2026-0104',
    customerName: 'Clarissa Tanoe',
    customerEmail: 'clarissa.t@arch.com',
    customerPhone: '+62 819-0011-2233',
    shippingCity: 'Jakarta Pusat',
    shippingAddress: 'Jl. Teuku Umar No. 12, Menteng, Jakarta Pusat, 10350',
    items: [
      {
        productId: 'prod-06',
        productName: 'ATELIER MODULAR TOTE',
        productImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400&auto=format&fit=crop',
        color: 'Obsidian Black',
        size: 'ONE SIZE',
        quantity: 1,
        unitPrice: 349000,
        totalPrice: 349000
      }
    ],
    subtotal: 349000,
    shippingFee: 25000,
    totalAmount: 374000,
    paymentMethod: 'MANUAL_TRANSFER',
    status: 'PENDING',
    createdAt: '2026-08-29T09:00:00Z',
  }
];

export const MOCK_CUSTOMERS: AdminCustomer[] = [
  {
    id: 'cust-01',
    name: 'Aria Wirasasmita',
    email: 'aria.wirasasmita@example.com',
    phone: '+62 812-3456-7890',
    totalOrders: 4,
    totalSpent: 4296000,
    styleArchetype: 'The Architectural Minimalist',
    city: 'Jakarta Selatan',
    status: 'ACTIVE',
    createdAt: '2026-06-12T00:00:00Z'
  },
  {
    id: 'cust-02',
    name: 'Dimas Prasetyo',
    email: 'dimas.prasetyo@atelier.id',
    phone: '+62 811-9988-7766',
    totalOrders: 2,
    totalSpent: 2098000,
    styleArchetype: 'The Radical Sculptor',
    city: 'Bandung',
    status: 'ACTIVE',
    createdAt: '2026-07-04T00:00:00Z'
  },
  {
    id: 'cust-03',
    name: 'Nadia Sastrowardoyo',
    email: 'nadia.s@studio.co.id',
    phone: '+62 813-2233-4455',
    totalOrders: 3,
    totalSpent: 1827000,
    styleArchetype: 'The Kinetic Urbanite',
    city: 'Surabaya',
    status: 'ACTIVE',
    createdAt: '2026-07-19T00:00:00Z'
  },
  {
    id: 'cust-04',
    name: 'Reza Rahardian',
    email: 'reza.rahardian@creative.id',
    phone: '+62 817-4455-6677',
    totalOrders: 5,
    totalSpent: 5120000,
    styleArchetype: 'The Modern Refiner',
    city: 'Denpasar',
    status: 'ACTIVE',
    createdAt: '2026-05-30T00:00:00Z'
  },
  {
    id: 'cust-05',
    name: 'Clarissa Tanoe',
    email: 'clarissa.t@arch.com',
    phone: '+62 819-0011-2233',
    totalOrders: 1,
    totalSpent: 374000,
    styleArchetype: 'The Architectural Minimalist',
    city: 'Jakarta Pusat',
    status: 'ACTIVE',
    createdAt: '2026-08-20T00:00:00Z'
  }
];

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'inv-1', productId: 'prod-01', productName: 'OVERSIZED FORM JACKET', sku: 'NOV-FRM-01-BLK-S', color: 'Obsidian Black', size: 'S', stock: 4, reserved: 1, available: 3, threshold: 3, status: 'IN_STOCK' },
  { id: 'inv-2', productId: 'prod-01', productName: 'OVERSIZED FORM JACKET', sku: 'NOV-FRM-01-BLK-M', color: 'Obsidian Black', size: 'M', stock: 8, reserved: 2, available: 6, threshold: 3, status: 'IN_STOCK' },
  { id: 'inv-3', productId: 'prod-01', productName: 'OVERSIZED FORM JACKET', sku: 'NOV-FRM-01-BLK-L', color: 'Obsidian Black', size: 'L', stock: 2, reserved: 1, available: 1, threshold: 3, status: 'LOW_STOCK' },
  { id: 'inv-4', productId: 'prod-01', productName: 'OVERSIZED FORM JACKET', sku: 'NOV-FRM-01-BLK-XL', color: 'Obsidian Black', size: 'XL', stock: 10, reserved: 0, available: 10, threshold: 3, status: 'IN_STOCK' },
  { id: 'inv-5', productId: 'prod-02', productName: 'SCULPTED TAILORED TROUSER', sku: 'NOV-FRM-02-BLK-28', color: 'Obsidian Black', size: '28', stock: 2, reserved: 0, available: 2, threshold: 3, status: 'LOW_STOCK' },
  { id: 'inv-6', productId: 'prod-02', productName: 'SCULPTED TAILORED TROUSER', sku: 'NOV-FRM-02-BLK-30', color: 'Obsidian Black', size: '30', stock: 6, reserved: 1, available: 5, threshold: 3, status: 'IN_STOCK' },
  { id: 'inv-7', productId: 'prod-04', productName: 'IDENTITY RAW TRENCH COAT', sku: 'NOV-IDN-04-BLK-L', color: 'Obsidian Black', size: 'L', stock: 1, reserved: 1, available: 0, threshold: 2, status: 'LOW_STOCK' },
];

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  grossSales: 38450000,
  grossSalesChange: 18.4,
  totalOrders: 42,
  totalOrdersChange: 12.5,
  totalPiecesInStock: 99,
  lowStockItemsCount: 3,
  activeCustomers: 128,
  activeCustomersChange: 24.0,
};

export const MOCK_SALES_TREND: SalesDataPoint[] = [
  { date: '22 Aug', sales: 3200000, orders: 4 },
  { date: '23 Aug', sales: 4800000, orders: 6 },
  { date: '24 Aug', sales: 2900000, orders: 3 },
  { date: '25 Aug', sales: 6100000, orders: 7 },
  { date: '26 Aug', sales: 5400000, orders: 5 },
  { date: '27 Aug', sales: 7200000, orders: 8 },
  { date: '28 Aug', sales: 8850000, orders: 9 },
];
