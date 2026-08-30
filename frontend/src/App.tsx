import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LenisProvider } from '@/app/providers/LenisProvider';
import { AppRoutes } from '@/app/routes/AppRoutes';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { SearchModal } from '@/components/layout/SearchModal';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useCatalogStore } from '@/store/useCatalogStore';

import { ScrollToTop } from '@/components/layout/ScrollToTop';

export const App: React.FC = () => {
  const initAuth = useAuthStore((state) => state.initAuth);
  const language = useLanguageStore((state) => state.language);
  const fetchCatalog = useCatalogStore((state) => state.fetchCatalog);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    fetchCatalog(language);
  }, [language, fetchCatalog]);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LenisProvider>
        <div className="min-h-screen bg-obsidian text-bone font-sans flex flex-col justify-between selection:bg-accent-lime selection:text-obsidian relative">
          {/* Navigation Bar */}
          <Navbar />

          {/* Main Route Content */}
          <main className="flex-1 w-full">
            <AppRoutes />
          </main>

          {/* Footer */}
          <Footer />

          {/* Global Drawers & Modals */}
          <CartDrawer />
          <SearchModal />
          <MobileMenu />
          <AuthModal />
        </div>
      </LenisProvider>
    </BrowserRouter>
  );
};
