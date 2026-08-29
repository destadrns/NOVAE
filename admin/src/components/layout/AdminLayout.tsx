import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SearchModal } from './SearchModal';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated } = useAdminAuthStore();

  // If not authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-obsidian text-bone font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Overlays */}
      <SearchModal />
      <ToastContainer />
    </div>
  );
};
