import { create } from 'zustand';
import {
  apiGetCart,
  apiAddToCart,
  apiUpdateCartItem,
  apiRemoveCartItem,
  apiClearCart,
  apiMergeCart,
  getGuestSessionKey,
  FrontendCartItem,
} from '@/lib/api';
import { useAuthStore } from './useAuthStore';

export type CartItem = FrontendCartItem;

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotalIdr: number;
  isLoading: boolean;
  error: string | null;
  sessionKey: string;

  // Actions
  fetchCart: (token?: string | null, lang?: string) => Promise<void>;
  addItem: (
    itemOrVariantId: any,
    colorOrQuantity?: string | number,
    size?: string,
    quantity?: number,
    token?: string | null,
    lang?: string,
  ) => Promise<boolean>;
  updateQuantity: (
    itemId: string,
    quantity: number,
    token?: string | null,
    lang?: string,
  ) => Promise<void>;
  removeItem: (itemId: string, token?: string | null, lang?: string) => Promise<void>;
  clearCart: (token?: string | null, lang?: string) => Promise<void>;
  mergeGuestCart: (token: string, lang?: string) => Promise<void>;

  // Synchronous convenience getters
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const getAuthToken = (explicitToken?: string | null): string | null => {
  if (explicitToken !== undefined) return explicitToken;
  try {
    return useAuthStore.getState().token;
  } catch {
    return null;
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemCount: 0,
  subtotalIdr: 0,
  isLoading: false,
  error: null,
  sessionKey: getGuestSessionKey(),

  fetchCart: async (token, lang = 'id') => {
    set({ isLoading: true, error: null });
    const authToken = getAuthToken(token);
    const sessionKey = get().sessionKey;
    const { data, error } = await apiGetCart(authToken, sessionKey, lang);
    set({ isLoading: false });

    if (error) {
      set({ error: Array.isArray(error.message) ? error.message.join(', ') : error.message });
    } else if (data) {
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotalIdr: data.subtotalIdr,
      });
    }
  },

  addItem: async (
    itemOrVariantId: any,
    colorOrQuantity?: string | number,
    size?: string,
    quantity?: number,
    token?: string | null,
    lang = 'id',
  ) => {
    const authToken = getAuthToken(token);
    const sessionKey = get().sessionKey;

    // Check if called with variantId string
    if (typeof itemOrVariantId === 'string') {
      const qty = typeof colorOrQuantity === 'number' ? colorOrQuantity : 1;
      set({ isLoading: true, error: null });
      const { data, error } = await apiAddToCart(itemOrVariantId, qty, authToken, sessionKey, lang);
      set({ isLoading: false });

      if (error) {
        set({ error: Array.isArray(error.message) ? error.message.join(', ') : error.message });
        return false;
      } else if (data) {
        set({
          items: data.items,
          itemCount: data.itemCount,
          subtotalIdr: data.subtotalIdr,
        });
        return true;
      }
      return false;
    }

    // Called with Product object (e.g. from ProductCard or ProductDetailPage)
    const product = itemOrVariantId;
    const chosenColor =
      typeof colorOrQuantity === 'string' ? colorOrQuantity : product.colors?.[0]?.name || 'Standard';
    const chosenSize = size || product.sizes?.[0] || 'M';
    const qty =
      typeof quantity === 'number'
        ? quantity
        : typeof colorOrQuantity === 'number'
        ? colorOrQuantity
        : 1;

    // Find variant from product object
    const matchingVariant =
      product.variants?.find(
        (v: any) =>
          v.id &&
          (!chosenColor || v.colorName?.toLowerCase() === chosenColor.toLowerCase()) &&
          (!chosenSize || v.size?.toLowerCase() === chosenSize.toLowerCase()),
      ) || product.variants?.[0];

    const variantId = matchingVariant?.id || product.slug || product.id;

    set({ isLoading: true, error: null });
    const { data, error } = await apiAddToCart(variantId, qty, authToken, sessionKey, lang);
    set({ isLoading: false });

    if (!error && data) {
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotalIdr: data.subtotalIdr,
      });
      return true;
    }

    if (error) {
      set({ error: Array.isArray(error.message) ? error.message.join(', ') : error.message });
      return false;
    }

    return false;
  },

  updateQuantity: async (itemId, quantity, token, lang = 'id') => {
    const authToken = getAuthToken(token);
    const sessionKey = get().sessionKey;

    if (quantity <= 0) {
      await get().removeItem(itemId, authToken, lang);
      return;
    }

    set({ isLoading: true, error: null });

    // Try backend API first
    const { data, error } = await apiUpdateCartItem(itemId, quantity, authToken, sessionKey, lang);
    set({ isLoading: false });

    if (!error && data) {
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotalIdr: data.subtotalIdr,
      });
    } else {
      // Local optimistic update fallback
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity, totalPriceIdr: item.unitPriceIdr * quantity }
            : item,
        );
        const totalItems = updated.reduce((acc, i) => acc + i.quantity, 0);
        const subtotal = updated.reduce((acc, i) => acc + i.totalPriceIdr, 0);
        return { items: updated, itemCount: totalItems, subtotalIdr: subtotal };
      });
    }
  },

  removeItem: async (itemId, token, lang = 'id') => {
    set({ isLoading: true, error: null });
    const authToken = getAuthToken(token);
    const sessionKey = get().sessionKey;

    const { data, error } = await apiRemoveCartItem(itemId, authToken, sessionKey, lang);
    set({ isLoading: false });

    if (!error && data) {
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotalIdr: data.subtotalIdr,
      });
    } else {
      // Local fallback
      set((state) => {
        const updated = state.items.filter((item) => item.id !== itemId);
        const totalItems = updated.reduce((acc, i) => acc + i.quantity, 0);
        const subtotal = updated.reduce((acc, i) => acc + i.totalPriceIdr, 0);
        return { items: updated, itemCount: totalItems, subtotalIdr: subtotal };
      });
    }
  },

  clearCart: async (token, lang = 'id') => {
    set({ isLoading: true, error: null });
    const authToken = getAuthToken(token);
    const sessionKey = get().sessionKey;

    const { data, error } = await apiClearCart(authToken, sessionKey, lang);
    set({ isLoading: false });

    if (!error && data) {
      set({
        items: [],
        itemCount: 0,
        subtotalIdr: 0,
      });
    } else {
      set({
        items: [],
        itemCount: 0,
        subtotalIdr: 0,
      });
    }
  },

  mergeGuestCart: async (token, lang = 'id') => {
    const guestKey = get().sessionKey;
    if (!guestKey || !token) return;

    set({ isLoading: true, error: null });
    const { data, error } = await apiMergeCart(guestKey, token, lang);
    set({ isLoading: false });

    if (!error && data) {
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotalIdr: data.subtotalIdr,
      });
    }
  },

  getTotalItems: () => {
    return get().itemCount || get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().subtotalIdr || get().items.reduce((sum, item) => sum + item.totalPriceIdr, 0);
  },
}));
