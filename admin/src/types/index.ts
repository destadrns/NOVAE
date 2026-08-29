export type Category = 'Outerwear' | 'Tops' | 'Bottoms' | 'Accessories';
export type CollectionId = 'FORM' | 'MOTION' | 'IDENTITY';

export interface ProductVariant {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size: string;
  stock: number;
  lowStockThreshold: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  category: Category;
  collection: CollectionId;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  totalStock: number;
  variants: ProductVariant[];
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  details: {
    material: string;
    fit: string;
    care: string;
    origin: string;
  };
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingCity: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'VA_BCA' | 'QRIS' | 'CREDIT_CARD' | 'MANUAL_TRANSFER';
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  styleArchetype: string;
  city: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  reserved: number;
  available: number;
  threshold: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface DashboardMetrics {
  grossSales: number;
  grossSalesChange: number;
  totalOrders: number;
  totalOrdersChange: number;
  totalPiecesInStock: number;
  lowStockItemsCount: number;
  activeCustomers: number;
  activeCustomersChange: number;
}

export interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ATELIER_MANAGER' | 'OPS_STAFF';
  avatar?: string;
}
