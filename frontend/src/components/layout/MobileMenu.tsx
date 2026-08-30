import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Instagram, Compass, User, Truck } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

export const MobileMenu: React.FC = () => {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { isAuthenticated, user, openAuthModal } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAccountClick = () => {
    closeMobileMenu();
    if (isAuthenticated) {
      navigate('/account');
    } else {
      openAuthModal('signin');
    }
  };

  const links = [
    { label: t.nav.collections, path: '/collections', subtitle: t.nav.collectionsSub },
    { label: t.nav.shop, path: '/shop', subtitle: t.nav.shopSub },
    { label: t.nav.styleFinder, path: '/style-finder', subtitle: t.nav.styleFinderSub },
    { label: t.nav.journal, path: '/journal', subtitle: t.nav.journalSub },
    { label: t.nav.about, path: '/about', subtitle: t.nav.aboutSub },
  ];

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-obsidian text-bone flex flex-col justify-between p-6 sm:p-10 lg:hidden overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="text-2xl font-extrabold tracking-widest font-display text-bone"
            >
              NOVAÉ<span className="text-accent-lime">.</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <button
                onClick={closeMobileMenu}
                className="p-2 text-muted hover:text-bone transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-6 sm:py-8 flex flex-col gap-5 sm:gap-6">
            {links.map((link, idx) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.06, duration: 0.4 }}
              >
                <Link
                  to={link.path}
                  onClick={closeMobileMenu}
                  className="group flex items-center justify-between py-1.5 sm:py-2 text-xl xs:text-2xl sm:text-3xl font-display font-bold tracking-tight hover:text-accent-lime transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <span className="block">{link.label}</span>
                    <span className="block text-[11px] sm:text-xs font-sans font-normal tracking-wider text-muted mt-0.5 sm:mt-1 leading-snug">
                      {link.subtitle}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-2 transition-all shrink-0 text-accent-lime" />
                </Link>
              </motion.div>
            ))}

            {/* Track Order Link in Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + links.length * 0.06, duration: 0.4 }}
            >
              <Link
                to="/track"
                onClick={closeMobileMenu}
                className="group flex items-center justify-between py-1.5 sm:py-2 text-xl xs:text-2xl sm:text-3xl font-display font-bold tracking-tight hover:text-cyan-300 transition-colors"
              >
                <div className="min-w-0 pr-4 flex items-center gap-3">
                  <Truck className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="block text-bone group-hover:text-cyan-300">
                      {t.nav.track || 'LACAK PESANAN'}
                    </span>
                    <span className="block text-[11px] sm:text-xs font-sans font-normal tracking-wider text-muted mt-0.5 leading-snug">
                      {t.nav.trackSub || 'Pantau Status & Resi Pengiriman'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-2 transition-all shrink-0 text-cyan-400" />
              </Link>
            </motion.div>

            {/* Account Link in Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + (links.length + 1) * 0.06, duration: 0.4 }}
            >
              <button
                onClick={handleAccountClick}
                className="w-full group flex items-center justify-between py-1.5 sm:py-2 text-xl xs:text-2xl sm:text-3xl font-display font-bold tracking-tight hover:text-accent-lime transition-colors text-left"
              >
                <div className="min-w-0 pr-4 flex items-center gap-3">
                  <User className="w-5 h-5 text-accent-lime" />
                  <div>
                    <span className="block text-bone group-hover:text-accent-lime">
                      {isAuthenticated && user ? user.fullName : t.nav.account}
                    </span>
                    <span className="block text-[11px] sm:text-xs font-sans font-normal tracking-wider text-muted mt-0.5 leading-snug">
                      {isAuthenticated ? user?.email : (t.nav.account === 'AKUN' ? 'Masuk / Daftar' : 'Sign in / Register')}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-2 transition-all shrink-0 text-accent-lime" />
              </button>
            </motion.div>
          </div>

          {/* Footer inside mobile menu */}
          <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs tracking-widest text-muted">
              <span>EDITION 2026</span>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-bone">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-bone">
                  <Compass className="w-4 h-4" />
                </a>
              </div>
            </div>
            <p className="text-[11px] text-muted-dark tracking-wider">
              WEAR THE UNEXPECTED. © 2026 NOVAÉ
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
