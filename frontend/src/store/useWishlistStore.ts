import { create } from 'zustand';
import {
  apiGetWishlist,
  apiAddToWishlist,
  apiRemoveFromWishlist,
  FrontendWishlistItem,
} from '@/lib/api';

interface WishlistState {
  wishlistIds: string[];
  items: FrontendWishlistItem[];
  isLoading: boolean;
  error: string | null;

  fetchWishlist: (token?: string | null, lang?: string) => Promise<void>;
  toggleWishlist: (productId: string, token?: string | null, lang?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const STORAGE_KEY = 'novae_wishlist_ids';

const loadInitialWishlist = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: loadInitialWishlist(),
  items: [],
  isLoading: false,
  error: null,

  fetchWishlist: async (token, lang = 'id') => {
    if (!token) return;
    set({ isLoading: true, error: null });
    const { data, error } = await apiGetWishlist(token, lang);
    set({ isLoading: false });

    if (!error && data) {
      const ids = data.items.map((i) => i.productId);
      set({
        items: data.items,
        wishlistIds: ids,
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      } catch {}
    }
  },

  toggleWishlist: async (productId: string, token, lang = 'id') => {
    const exists = get().wishlistIds.includes(productId);
    const updatedIds = exists
      ? get().wishlistIds.filter((id) => id !== productId)
      : [...get().wishlistIds, productId];

    // Optimistic UI update
    set({ wishlistIds: updatedIds });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIds));
    } catch {}

    // If authenticated, sync with backend API
    if (token) {
      if (exists) {
        const { data } = await apiRemoveFromWishlist(productId, token, lang);
        if (data) {
          set({
            items: data.items,
            wishlistIds: data.items.map((i) => i.productId),
          });
        }
      } else {
        const { data } = await apiAddToWishlist(productId, token, lang);
        if (data) {
          set({
            items: data.items,
            wishlistIds: data.items.map((i) => i.productId),
          });
        }
      }
    }
  },

  isInWishlist: (productId: string) => {
    return get().wishlistIds.includes(productId);
  },
}));
