import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';

// Lazy-loaded Admin Route Pages
const AdminLoginPage = lazy(() => import('@/pages/Login/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductsListPage = lazy(() => import('@/pages/Products/ProductsListPage').then((m) => ({ default: m.ProductsListPage })));
const CollectionsListPage = lazy(() => import('@/pages/Collections/CollectionsListPage').then((m) => ({ default: m.CollectionsListPage })));
const InventoryMatrixPage = lazy(() => import('@/pages/Inventory/InventoryMatrixPage').then((m) => ({ default: m.InventoryMatrixPage })));
const OrdersListPage = lazy(() => import('@/pages/Orders/OrdersListPage').then((m) => ({ default: m.OrdersListPage })));
const CustomersListPage = lazy(() => import('@/pages/Customers/CustomersListPage').then((m) => ({ default: m.CustomersListPage })));
const JournalListPage = lazy(() => import('@/pages/Journal/JournalListPage').then((m) => ({ default: m.JournalListPage })));
const StyleFinderConfigPage = lazy(() => import('@/pages/StyleFinder/StyleFinderConfigPage').then((m) => ({ default: m.StyleFinderConfigPage })));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

// Sleek Admin Fallback Loader
const AdminPageLoader: React.FC = () => (
  <div className="p-8 flex items-center justify-center min-h-[50vh]">
    <div className="text-xs font-mono tracking-[0.3em] text-muted uppercase animate-pulse">
      LOADING ATELIER MODULE...
    </div>
  </div>
);

// Protected Admin Guard
const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-bone font-mono text-xs tracking-widest uppercase">
        Verifying Atelier Access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
};

export const App: React.FC = () => {
  const { initAuth } = useAdminAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Suspense fallback={<AdminPageLoader />}>
        <Routes>
          {/* Unauthenticated Login Route */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Authenticated & Protected Admin Shell Routes */}
          <Route path="/" element={<AdminProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsListPage />} />
            <Route path="collections" element={<CollectionsListPage />} />
            <Route path="inventory" element={<InventoryMatrixPage />} />
            <Route path="orders" element={<OrdersListPage />} />
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="journal" element={<JournalListPage />} />
            <Route path="style-finder" element={<StyleFinderConfigPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
