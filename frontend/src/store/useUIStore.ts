import { create } from 'zustand';

interface UIState {
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  closeAllDrawers: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
  openCart: () => set({ isCartOpen: true, isSearchOpen: false, isMobileMenuOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen, isSearchOpen: false, isMobileMenuOpen: false })),
  openSearch: () => set({ isSearchOpen: true, isCartOpen: false, isMobileMenuOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen, isCartOpen: false, isMobileMenuOpen: false })),
  openMobileMenu: () => set({ isMobileMenuOpen: true, isCartOpen: false, isSearchOpen: false }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen, isCartOpen: false, isSearchOpen: false })),
  closeAllDrawers: () => set({ isCartOpen: false, isSearchOpen: false, isMobileMenuOpen: false }),
}));
