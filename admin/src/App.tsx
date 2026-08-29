import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminLoginPage } from '@/pages/Login/AdminLoginPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { ProductsListPage } from '@/pages/Products/ProductsListPage';
import { CollectionsListPage } from '@/pages/Collections/CollectionsListPage';
import { InventoryMatrixPage } from '@/pages/Inventory/InventoryMatrixPage';
import { OrdersListPage } from '@/pages/Orders/OrdersListPage';
import { CustomersListPage } from '@/pages/Customers/CustomersListPage';
import { JournalListPage } from '@/pages/Journal/JournalListPage';
import { StyleFinderConfigPage } from '@/pages/StyleFinder/StyleFinderConfigPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';

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
    </BrowserRouter>
  );
};
