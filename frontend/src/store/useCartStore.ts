import { create } from 'zustand';
import { Product, PRODUCTS } from '@/data/products';

export interface CartItem {
  id: string; // unique item id: `${product.id}-${color}-${size}`
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, color?: string, size?: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  // Pre-populate with sample items as shown in PRD §22 (Oversized Form Jacket & Sculpted Trouser)
  items: [
    {
      id: 'prod-01-Obsidian Black-L',
      product: PRODUCTS[0],
      selectedColor: 'Obsidian Black',
      selectedSize: 'L',
      quantity: 1,
    },
  ],

  addItem: (product, color, size, quantity = 1) => {
    const chosenColor = color || product.colors[0]?.name || 'Standard';
    const chosenSize = size || product.sizes[0] || 'M';
    const uniqueId = `${product.id}-${chosenColor}-${chosenSize}`;

    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.id === uniqueId);
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        return { items: updated };
      }
      return {
        items: [
          ...state.items,
          {
            id: uniqueId,
            product,
            selectedColor: chosenColor,
            selectedSize: chosenSize,
            quantity,
          },
        ],
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },
}));
