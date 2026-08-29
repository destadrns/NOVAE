import { create } from 'zustand';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const STORAGE_KEY = 'novae_wishlist_ids';

const loadInitialWishlist = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : ['prod-01'];
  } catch {
    return ['prod-01'];
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: loadInitialWishlist(),

  toggleWishlist: (productId: string) => {
    set((state) => {
      const exists = state.wishlistIds.includes(productId);
      const updated = exists
        ? state.wishlistIds.filter((id) => id !== productId)
        : [...state.wishlistIds, productId];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed saving wishlist to localStorage', err);
      }

      return { wishlistIds: updated };
    });
  },

  isInWishlist: (productId: string) => {
    return get().wishlistIds.includes(productId);
  },
}));
