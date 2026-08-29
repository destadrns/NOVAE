import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/Home/HomePage';
import { useAuthStore } from '@/store/useAuthStore';

// Lazy-load non-critical routes — HomePage stays eager for instant LCP
const ShopPage = lazy(() => import('@/pages/Shop/ShopPage').then(m => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import('@/pages/Product/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CollectionsPage = lazy(() => import('@/pages/Collections/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const StyleFinderPage = lazy(() => import('@/pages/StyleFinder/StyleFinderPage').then(m => ({ default: m.StyleFinderPage })));
const JournalPage = lazy(() => import('@/pages/Journal/JournalPage').then(m => ({ default: m.JournalPage })));
const JournalDetailPage = lazy(() => import('@/pages/Journal/JournalDetailPage').then(m => ({ default: m.JournalDetailPage })));
const AboutPage = lazy(() => import('@/pages/About/AboutPage').then(m => ({ default: m.AboutPage })));
const AccountPage = lazy(() => import('@/pages/Account/AccountPage').then(m => ({ default: m.AccountPage })));

// Minimal loading fallback — matches the NOVAÉ dark aesthetic
const PageLoader = () => (
  <div className="min-h-screen bg-obsidian flex items-center justify-center">
    <div className="text-xs font-mono tracking-[0.3em] text-muted uppercase animate-pulse">
      LOADING...
    </div>
  </div>
);

// Protected Customer Route Component
const CustomerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthModal('signin');
    }
  }, [isLoading, isAuthenticated, openAuthModal]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Scroll restoration helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionsPage />} />
          <Route path="/style-finder" element={<StyleFinderPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/account"
            element={
              <CustomerProtectedRoute>
                <AccountPage />
              </CustomerProtectedRoute>
            }
          />
          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </>
  );
};
