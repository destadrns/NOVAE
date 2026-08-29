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

// ------------------------------------------------------------------
// AUTH API
// ------------------------------------------------------------------
export async function verifyAdminSession(token: string) {
  return fetchWithAuth<{
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    avatarUrl?: string | null;
  }>('/admin/me', token);
}

// ------------------------------------------------------------------
// ADMIN CATALOG TYPES & APIS
// ------------------------------------------------------------------
export interface BackendCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  sortOrder: number;
}

export interface BackendCollection {
  id: string;
  code: string;
  slug: string;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: string;
  sortOrder: number;
  productsCount?: number;
  translations?: Array<{
    id: string;
    language: 'id' | 'en';
    name: string;
    description?: string | null;
  }>;
}

export interface BackendVariant {
  id: string;
  sku: string;
  colorName: string;
  colorCode?: string | null;
  size: string;
  priceOverrideIdr?: number | null;
  status: 'active' | 'inactive' | 'archived';
  imageUrl?: string | null;
  stock?: number;
}

export interface BackendProductTranslation {
  id?: string;
  language: 'id' | 'en';
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  materialDescription?: string | null;
  provenanceText?: string | null;
}

export interface BackendProductImage {
  id?: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface BackendAdminProduct {
  id: string;
  skuRoot: string;
  slug: string;
  name: string;
  basePriceIdr: number;
  status: 'draft' | 'active' | 'archived';
  featured: boolean;
  isNewDrop: boolean;
  limitedRun: boolean;
  featuredRank?: number | null;
  primaryImageUrl?: string | null;
  totalStock: number;
  variantsCount: number;
  category: BackendCategory;
  collection?: BackendCollection | null;
  translations: BackendProductTranslation[];
  variants: BackendVariant[];
  images?: BackendProductImage[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductsQuery {
  search?: string;
  category?: string;
  collection?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function adminGetProducts(token: string | null, query: AdminProductsQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.append('search', query.search);
  if (query.category && query.category !== 'ALL') params.append('category', query.category);
  if (query.collection && query.collection !== 'ALL') params.append('collection', query.collection);
  if (query.status && query.status !== 'ALL') params.append('status', query.status);
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));

  const queryString = params.toString();
  const path = `/admin/products${queryString ? `?${queryString}` : ''}`;

  return fetchWithAuth<{
    data: BackendAdminProduct[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(path, token);
}

export async function adminGetProductById(token: string | null, id: string) {
  return fetchWithAuth<BackendAdminProduct>(`/admin/products/${id}`, token);
}

export async function adminCreateProduct(token: string | null, payload: any) {
  return fetchWithAuth<BackendAdminProduct>('/admin/products', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateProduct(token: string | null, id: string, payload: any) {
  return fetchWithAuth<BackendAdminProduct>(`/admin/products/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function adminArchiveProduct(token: string | null, id: string) {
  return fetchWithAuth<{ message: string; id: string; status: string }>(
    `/admin/products/${id}`,
    token,
    {
      method: 'DELETE',
    },
  );
}

export async function adminCreateVariant(token: string | null, productId: string, payload: any) {
  return fetchWithAuth<BackendVariant>(`/admin/products/${productId}/variants`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateVariant(token: string | null, variantId: string, payload: any) {
  return fetchWithAuth<BackendVariant>(`/admin/variants/${variantId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteVariant(token: string | null, variantId: string) {
  return fetchWithAuth<{ message: string; id: string; status?: string }>(
    `/admin/variants/${variantId}`,
    token,
    {
      method: 'DELETE',
    },
  );
}

export async function adminGetCollections(token: string | null) {
  return fetchWithAuth<BackendCollection[]>('/admin/collections', token);
}

export async function adminGetCategories(token?: string | null) {
  return fetchWithAuth<BackendCategory[]>('/categories', token);
}

// ------------------------------------------------------------------
// ADMIN INVENTORY TYPES & APIS
// ------------------------------------------------------------------
export type InventoryHealthStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface BackendInventoryItem {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  productId: string;
  productSlug: string;
  colorName: string;
  colorCode?: string | null;
  size: string;
  priceOverrideIdr?: number | null;
  basePriceIdr: number;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  status: InventoryHealthStatus;
  variantStatus: string;
  category?: {
    id: string;
    slug: string;
    name: string;
  } | null;
  collection?: {
    id: string;
    code: string;
    slug: string;
    name: string;
  } | null;
  updatedAt: string;
}

export interface BackendInventoryMovement {
  id: string;
  variantId: string;
  movementType: 'purchase' | 'sale' | 'reservation' | 'release' | 'restock' | 'adjustment' | 'return';
  quantityDelta: number;
  referenceType?: string | null;
  referenceId?: string | null;
  note?: string | null;
  createdByName?: string | null;
  createdByEmail?: string | null;
  createdAt: string;
}

export interface BackendInventorySummary {
  totalPieces: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface AdminInventoryQuery {
  search?: string;
  status?: string;
  category?: string;
  collection?: string;
  page?: number;
  limit?: number;
}

export async function adminGetInventory(
  token: string | null,
  query: AdminInventoryQuery = {},
) {
  const params = new URLSearchParams();
  if (query.search) params.append('search', query.search);
  if (query.status && query.status !== 'ALL') params.append('status', query.status);
  if (query.category && query.category !== 'ALL') params.append('category', query.category);
  if (query.collection && query.collection !== 'ALL') params.append('collection', query.collection);
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));

  const queryString = params.toString();
  const path = `/admin/inventory${queryString ? `?${queryString}` : ''}`;

  return fetchWithAuth<{
    data: BackendInventoryItem[];
    summary: BackendInventorySummary;
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>(path, token);
}

export async function adminGetLowStockInventory(token: string | null) {
  return fetchWithAuth<BackendInventoryItem[]>('/admin/inventory/low-stock', token);
}

export async function adminGetVariantInventory(token: string | null, variantId: string) {
  return fetchWithAuth<BackendInventoryItem>(`/admin/inventory/${variantId}`, token);
}

export async function adminAdjustInventory(
  token: string | null,
  variantId: string,
  payload: {
    quantityDelta: number;
    movementType?: string;
    note?: string;
    lowStockThreshold?: number;
    referenceType?: string;
    referenceId?: string;
  },
) {
  return fetchWithAuth<BackendInventoryItem>(`/admin/inventory/${variantId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function adminGetInventoryMovements(token: string | null, variantId: string) {
  return fetchWithAuth<BackendInventoryMovement[]>(
    `/admin/inventory/${variantId}/movements`,
    token,
  );
}

// ------------------------------------------------------------------
// ADMIN ORDERS TYPES & APIS
// ------------------------------------------------------------------

export interface AdminOrderItem {
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
  inventory?: {
    quantityOnHand: number;
    reservedQuantity: number;
    available: number;
  } | null;
}

export interface AdminOrderStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note?: string | null;
  changedBy?: string | null;
  createdAt: string;
}

export interface AdminOrderPayment {
  id: string;
  provider: string;
  method?: string | null;
  amountIdr: number;
  status: string;
  paidAt?: string | null;
}

export interface AdminOrderShipment {
  id: string;
  trackingNumber?: string | null;
  courier?: string | null;
  status: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

export interface BackendAdminOrder {
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
  customerName: string;
  customerId?: string | null;
  shippingAddress: any;
  items: AdminOrderItem[];
  itemCount: number;
  statusHistory: AdminOrderStatusHistory[];
  payments: AdminOrderPayment[];
  shipment?: AdminOrderShipment | null;
  allowedTransitions: string[];
  placedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrdersQuery {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function adminGetOrders(token: string | null, query: AdminOrdersQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.append('search', query.search);
  if (query.status && query.status !== 'ALL') params.append('status', query.status);
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));

  const queryString = params.toString();
  const path = `/admin/orders${queryString ? `?${queryString}` : ''}`;

  return fetchWithAuth<{
    data: BackendAdminOrder[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>(path, token);
}

export async function adminGetOrderById(token: string | null, orderId: string) {
  return fetchWithAuth<BackendAdminOrder>(`/admin/orders/${orderId}`, token);
}

export async function adminUpdateOrderStatus(
  token: string | null,
  orderId: string,
  payload: {
    status: string;
    note?: string;
    trackingNumber?: string;
  },
) {
  return fetchWithAuth<BackendAdminOrder>(`/admin/orders/${orderId}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

