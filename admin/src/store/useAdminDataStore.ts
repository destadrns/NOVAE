import { create } from 'zustand';
import {
  AdminProduct,
  AdminOrder,
  AdminCustomer,
  InventoryItem,
  DashboardMetrics,
  OrderStatus,
} from '@/types';
import {
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_CUSTOMERS,
  MOCK_INVENTORY_ITEMS,
  MOCK_DASHBOARD_METRICS,
} from '@/data/mockData';

interface AdminDataState {
  products: AdminProduct[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  inventory: InventoryItem[];
  metrics: DashboardMetrics;

  addProduct: (product: Omit<AdminProduct, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;

  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  adjustStock: (inventoryId: string, addedStock: number) => void;
}

export const useAdminDataStore = create<AdminDataState>((set) => ({
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
  customers: MOCK_CUSTOMERS,
  inventory: MOCK_INVENTORY_ITEMS,
  metrics: MOCK_DASHBOARD_METRICS,

  addProduct: (newProd) => {
    const id = `prod-${Date.now()}`;
    const product: AdminProduct = {
      ...newProd,
      id,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ products: [product, ...state.products] }));
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  updateOrderStatus: (orderId, status, trackingNumber) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              ...(trackingNumber !== undefined ? { trackingNumber } : {}),
            }
          : o
      ),
    }));
  },

  adjustStock: (inventoryId, addedStock) => {
    set((state) => ({
      inventory: state.inventory.map((inv) => {
        if (inv.id === inventoryId) {
          const newStock = Math.max(0, inv.stock + addedStock);
          const newAvailable = Math.max(0, newStock - inv.reserved);
          let newStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
          if (newStock === 0) newStatus = 'OUT_OF_STOCK';
          else if (newStock <= inv.threshold) newStatus = 'LOW_STOCK';

          return {
            ...inv,
            stock: newStock,
            available: newAvailable,
            status: newStatus,
          };
        }
        return inv;
      }),
    }));
  },
}));
