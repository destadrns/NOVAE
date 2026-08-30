const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
export const API_BASE_URL = metaEnv.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export async function fetchWithAuth<T>(
  path: string,
  token?: string | null,
  options: RequestInit = {},
): Promise<{ data: T | null; error: ApiError | null }> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: {
          statusCode: res.status,
          message: body?.message || res.statusText || 'API Request failed',
          error: body?.error,
        },
      };
    }

    return { data: body as T, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        statusCode: 500,
        message: (err as Error).message || 'Network error connecting to backend',
        error: 'NetworkError',
      },
    };
  }
}

export async function fetchCurrentProfile(token: string) {
  return fetchWithAuth<{
    id: string;
    email: string;
    fullName: string;
    role: 'customer' | 'admin';
    status: 'active' | 'inactive' | 'suspended';
    avatarUrl?: string | null;
    preferences?: {
      language: 'id' | 'en';
      marketingOptIn: boolean;
    } | null;
    createdAt: string;
  }>('/auth/me', token);
}

// ------------------------------------------------------------------
// CART & WISHLIST CLIENT APIS & TYPES
// ------------------------------------------------------------------

export interface FrontendCartItem {
  id: string;
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  colorName: string;
  colorCode?: string | null;
  size: string;
  sku: string;
  imageUrl?: string | null;
  quantity: number;
  unitPriceIdr: number;
  totalPriceIdr: number;
  availableQuantity: number;
  isAvailable: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface FrontendCart {
  id: string;
  userId?: string | null;
  sessionKey?: string | null;
  status: string;
  currency: string;
  itemCount: number;
  subtotalIdr: number;
  totalIdr: number;
  items: FrontendCartItem[];
}

export interface FrontendWishlistItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  skuRoot: string;
  basePriceIdr: number;
  imageUrl?: string | null;
  status: string;
  isAvailable: boolean;
  categoryName?: string | null;
  collectionCode?: string | null;
  createdAt: string;
}

export interface FrontendWishlist {
  id: string;
  userId: string;
  itemCount: number;
  items: FrontendWishlistItem[];
}

export function getGuestSessionKey(): string {
  const KEY = 'novae_guest_session_key';
  try {
    let key = localStorage.getItem(KEY);
    if (!key) {
      key = `guest-${Math.random().toString(36).substring(2)}-${Date.now()}`;
      localStorage.setItem(KEY, key);
    }
    return key;
  } catch {
    return 'guest-fallback-session';
  }
}

export async function apiGetCart(token?: string | null, sessionKey?: string, lang: string = 'id') {
  const sKey = sessionKey || getGuestSessionKey();
  return fetchWithAuth<FrontendCart>(`/cart?lang=${lang}`, token, {
    headers: { 'x-session-key': sKey },
  });
}

export async function apiAddToCart(
  variantId: string,
  quantity: number = 1,
  token?: string | null,
  sessionKey?: string,
  lang: string = 'id',
) {
  const sKey = sessionKey || getGuestSessionKey();
  return fetchWithAuth<FrontendCart>(`/cart/items?lang=${lang}`, token, {
    method: 'POST',
    headers: { 'x-session-key': sKey },
    body: JSON.stringify({ variantId, quantity }),
  });
}

export async function apiUpdateCartItem(
  itemId: string,
  quantity: number,
  token?: string | null,
  sessionKey?: string,
  lang: string = 'id',
) {
  const sKey = sessionKey || getGuestSessionKey();
  return fetchWithAuth<FrontendCart>(`/cart/items/${itemId}?lang=${lang}`, token, {
    method: 'PATCH',
    headers: { 'x-session-key': sKey },
    body: JSON.stringify({ quantity }),
  });
}

export async function apiRemoveCartItem(
  itemId: string,
  token?: string | null,
  sessionKey?: string,
  lang: string = 'id',
) {
  const sKey = sessionKey || getGuestSessionKey();
  return fetchWithAuth<FrontendCart>(`/cart/items/${itemId}?lang=${lang}`, token, {
    method: 'DELETE',
    headers: { 'x-session-key': sKey },
  });
}

export async function apiClearCart(token?: string | null, sessionKey?: string, lang: string = 'id') {
  const sKey = sessionKey || getGuestSessionKey();
  return fetchWithAuth<FrontendCart>(`/cart?lang=${lang}`, token, {
    method: 'DELETE',
    headers: { 'x-session-key': sKey },
  });
}

export async function apiMergeCart(guestSessionKey: string, token: string, lang: string = 'id') {
  return fetchWithAuth<FrontendCart>(`/cart/merge?lang=${lang}`, token, {
    method: 'POST',
    body: JSON.stringify({ guestSessionKey }),
  });
}

export async function apiGetWishlist(token: string, lang: string = 'id') {
  return fetchWithAuth<FrontendWishlist>(`/wishlist?lang=${lang}`, token);
}

export async function apiAddToWishlist(productId: string, token: string, lang: string = 'id') {
  return fetchWithAuth<FrontendWishlist>(`/wishlist/items?lang=${lang}`, token, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export async function apiRemoveFromWishlist(productId: string, token: string, lang: string = 'id') {
  return fetchWithAuth<FrontendWishlist>(`/wishlist/items/${productId}?lang=${lang}`, token, {
    method: 'DELETE',
  });
}

export async function apiClearWishlist(token: string, lang: string = 'id') {
  return fetchWithAuth<FrontendWishlist>(`/wishlist?lang=${lang}`, token, {
    method: 'DELETE',
  });
}

// ------------------------------------------------------------------
// ORDERS CLIENT APIS & TYPES
// ------------------------------------------------------------------

export interface CreateOrderPayload {
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country?: string;
    notes?: string;
    saveAddress?: boolean;
  };
  shippingMethod: string;
  paymentMethod?: string;
  customerNotes?: string;
}

export interface FrontendPayment {
  id: string;
  provider: string;
  method?: string | null;
  amountIdr: number;
  status: string;
  paidAt?: string | null;
}

export interface FrontendOrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  colorName?: string | null;
  size?: string | null;
  unitPriceIdr: number;
  quantity: number;
  lineTotalIdr: number;
  imageUrl?: string | null;
}

export interface FrontendShipment {
  id: string;
  courier?: string | null;
  service?: string | null;
  trackingNumber?: string | null;
  status: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

export interface FrontendOrderStatusHistory {
  id: string;
  fromStatus?: string | null;
  toStatus: string;
  note?: string | null;
  createdAt: string;
}

export interface FrontendOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotalIdr: number;
  shippingIdr: number;
  taxIdr: number;
  discountIdr: number;
  totalIdr: number;
  currency: string;
  customerEmail: string;
  shippingAddress: any;
  items: FrontendOrderItem[];
  payments?: FrontendPayment[];
  shipment?: FrontendShipment | null;
  statusHistory?: FrontendOrderStatusHistory[];
  placedAt?: string | null;
  createdAt: string;
}

export async function apiCreateOrder(token: string, payload: CreateOrderPayload, lang: string = 'id') {
  return fetchWithAuth<FrontendOrder>(`/orders?lang=${lang}`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiGetUserOrders(token: string, lang: string = 'id') {
  return fetchWithAuth<FrontendOrder[]>(`/orders?lang=${lang}`, token);
}

export async function apiGetOrderById(token: string, orderId: string, lang: string = 'id') {
  return fetchWithAuth<FrontendOrder>(`/orders/${orderId}?lang=${lang}`, token);
}

export interface SimulatePaymentPayload {
  scenario: 'success' | 'failed' | 'cancel';
  method?: string;
}

export async function apiSimulatePayment(
  token: string,
  orderId: string,
  payload: SimulatePaymentPayload,
  lang: string = 'id',
) {
  return fetchWithAuth<FrontendOrder>(`/orders/${orderId}/simulate-payment?lang=${lang}`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ================================================================
// JOURNAL ARTICLES (Public)
// ================================================================

export interface FrontendArticle {
  id: string;
  slug: string;
  category: string;
  coverImageUrl?: string | null;
  author: string;
  readingTimeMinutes: number;
  status: string;
  featured: boolean;
  title: string;
  excerpt?: string | null;
  content?: string;
  publishedAt?: string | null;
  createdAt: string;
}

export interface PaginatedArticles {
  data: FrontendArticle[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// ================================================================
// PRODUCTS (Public Catalog)
// ================================================================

export interface ApiProductItem {
  id: string;
  skuRoot: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  materialDescription?: string;
  provenanceText?: string;
  basePriceIdr: number;
  category: { id: string; name: string; slug: string };
  collection?: { id: string; name: string; slug: string; code: string } | null;
  primaryImageUrl?: string | null;
  images: string[];
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  tags: string[];
  stock?: number;
  totalStock?: number;
  featured: boolean;
  isNewDrop: boolean;
  limitedRun?: boolean;
  variants?: Array<{
    id: string;
    sku: string;
    colorName: string;
    colorCode?: string;
    size: string;
    priceOverrideIdr?: number | null;
    stock?: number;
    status?: string;
  }>;
}

export function mapApiProductToFrontend(apiProd: any) {
  const colors =
    apiProd.colors && apiProd.colors.length > 0
      ? apiProd.colors
      : [{ name: 'Standard', hex: '#0B0C0E' }];
  const sizes =
    apiProd.sizes && apiProd.sizes.length > 0 ? apiProd.sizes : ['S', 'M', 'L', 'XL'];
  const images =
    apiProd.images && apiProd.images.length > 0
      ? apiProd.images
      : [apiProd.primaryImageUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985'];

  return {
    id: apiProd.id,
    name: apiProd.name || apiProd.skuRoot,
    slug: apiProd.slug,
    tagline: apiProd.shortDescription || apiProd.description || '',
    description: apiProd.description || apiProd.shortDescription || '',
    price: Number(apiProd.basePriceIdr) || 0,
    category: (apiProd.category?.name || apiProd.category?.slug || 'Outerwear') as any,
    collection: (apiProd.collection?.code || apiProd.collection?.name || 'FORM') as any,
    images,
    colors,
    sizes,
    stock: apiProd.totalStock ?? apiProd.stock ?? 20,
    tags: apiProd.tags || [],
    featured: Boolean(apiProd.featured),
    newArrival: Boolean(apiProd.isNewDrop),
    details: {
      material: apiProd.materialDescription || 'Curated Atelier Fabric',
      fit: 'Sculptural Tailored Cut',
      care: 'Dry clean only.',
      origin: apiProd.provenanceText || 'Crafted in Atelier Bandung',
    },
    variants: apiProd.variants || [],
  };
}

export async function apiGetProducts(params?: {
  category?: string;
  collection?: string;
  sort?: string;
  lang?: string;
}) {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.collection && params.collection !== 'All') query.set('collection', params.collection);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.lang) query.set('lang', params.lang);
  query.set('limit', '50');

  const url = `${API_BASE_URL}/products?${query.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { data: null, error: { statusCode: res.status, message: 'Failed to fetch products' } };
    }
    const body = await res.json();
    return { data: body, error: null };
  } catch {
    return { data: null, error: { statusCode: 0, message: 'Network error' } };
  }
}

export async function apiGetProductBySlug(slug: string, lang: string = 'id') {
  const url = `${API_BASE_URL}/products/${slug}?lang=${lang}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { data: null, error: { statusCode: res.status, message: 'Product not found' } };
    }
    const body = await res.json();
    return { data: body, error: null };
  } catch {
    return { data: null, error: { statusCode: 0, message: 'Network error' } };
  }
}

export async function apiGetArticles(lang: string = 'id') {
  const url = `${API_BASE_URL}/articles?lang=${lang}&limit=50`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { data: null, error: { statusCode: res.status, message: 'Failed to fetch articles' } };
    }
    const body: PaginatedArticles = await res.json();
    return { data: body, error: null };
  } catch {
    return { data: null, error: { statusCode: 0, message: 'Network error' } };
  }
}

export async function apiGetArticleBySlug(slug: string, lang: string = 'id') {
  const url = `${API_BASE_URL}/articles/${slug}?lang=${lang}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { data: null, error: { statusCode: res.status, message: 'Article not found' } };
    }
    const body: FrontendArticle = await res.json();
    return { data: body, error: null };
  } catch {
    return { data: null, error: { statusCode: 0, message: 'Network error' } };
  }
}
