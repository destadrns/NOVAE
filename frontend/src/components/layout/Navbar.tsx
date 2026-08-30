import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User, Truck } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { scrollToTop } from '@/lib/scroll';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { openCart, toggleSearch, isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { openAuthModal, isAuthenticated, user } = useAuthStore();
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.collections, path: '/collections' },
    { label: t.nav.shop, path: '/shop' },
    { label: t.nav.styleFinder, path: '/style-finder' },
    { label: t.nav.journal, path: '/journal' },
    { label: t.nav.about, path: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-obsidian/85 backdrop-blur-md border-b border-white/10 py-4 shadow-2xl'
          : 'bg-gradient-to-b from-obsidian/90 via-obsidian/40 to-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Left Zone: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                scrollToTop(true);
              }
            }}
            className="group flex items-center gap-2 text-2xl md:text-3xl font-extrabold tracking-wider font-display text-bone transition-transform duration-300 hover:scale-[1.02]"
          >
            <span className="tracking-widest">NOVAÉ</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-lime inline-block transition-transform group-hover:scale-150 duration-300" />
          </Link>
        </div>

        {/* Center Zone: Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-10 mx-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => {
                  if (isActive) {
                    e.preventDefault();
                    scrollToTop(true);
                  }
                }}
                className={`text-[11px] xl:text-xs uppercase tracking-[0.16em] xl:tracking-[0.22em] font-medium transition-all duration-300 hover:text-bone relative py-1 whitespace-nowrap ${
                  isActive ? 'text-bone font-semibold' : 'text-muted-light hover:text-bone'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent-lime transform origin-left shadow-[0_0_8px_rgba(216,255,0,0.4)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Zone: Curated Utility Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-3.5 xl:gap-4 shrink-0">
          {/* Subtle Vertical Divider between Center Nav and Utility on Desktop */}
          <div className="hidden lg:block h-4 w-[1px] bg-white/15 mr-0.5" />

          {/* Language Switcher */}
          <LanguageSwitcher className="hidden sm:inline-flex shrink-0 whitespace-nowrap" />

          {/* Search Trigger */}
          <button
            onClick={toggleSearch}
            className="flex items-center gap-1.5 sm:gap-2 text-xs uppercase tracking-[0.16em] text-muted-light hover:text-bone hover:bg-white/5 transition-all p-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-bone/40 shrink-0"
            aria-label="Search Catalog"
          >
            <Search className="w-4 h-4 text-muted-light hover:text-bone transition-colors" />
            <span className="hidden 2xl:inline">{t.nav.search}</span>
          </button>

          {/* Track Order Direct Link */}
          <Link
            to="/track"
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-light hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all py-1.5 px-2 sm:px-2.5 rounded-sm shrink-0"
            aria-label="Track Order"
          >
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{t.nav.track || 'LACAK PESANAN'}</span>
          </Link>

          {/* Account Button / Link */}
          {isAuthenticated && user ? (
            <Link
              to="/account"
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-bone bg-white/5 hover:bg-white/10 border border-white/15 transition-all py-1.5 px-2.5 rounded-sm shrink-0 shadow-sm"
              aria-label="Customer Account"
            >
              <User className="w-3.5 h-3.5 text-accent-lime" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.fullName ? user.fullName.split(' ')[0] : t.nav.account}</span>
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-light hover:text-bone hover:bg-white/5 border border-white/10 transition-all py-1.5 px-2.5 rounded-sm shrink-0"
              aria-label="Customer Account"
            >
              <User className="w-3.5 h-3.5 text-muted-light" />
              <span className="hidden sm:inline">{t.nav.account}</span>
            </button>
          )}

          {/* Bag Drawer Trigger */}
          <button
            onClick={openCart}
            className="group flex items-center gap-2 text-xs uppercase tracking-[0.14em] sm:tracking-[0.18em] text-bone bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 transition-all duration-300 py-2 px-3 sm:px-3.5 rounded-full shrink-0 whitespace-nowrap shadow-sm"
            aria-label={`Shopping Bag, ${totalItems} items`}
          >
            <ShoppingBag className="w-4 h-4 text-bone group-hover:text-accent-lime transition-colors shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">{t.nav.bag} ({totalItems})</span>
          </button>

          {/* Mobile / Tablet Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-bone hover:text-accent-lime transition-colors focus:outline-none shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};
