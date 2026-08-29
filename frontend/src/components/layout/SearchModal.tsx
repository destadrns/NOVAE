import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { PRODUCTS } from '@/data/products';
import { formatIDR } from '@/lib/formatters';
import { useTranslation } from '@/i18n/useTranslation';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSearchOpen, closeSearch]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query]);

  const quickTags = ['Oversized', 'Jacket', 'Form', 'Kimono', 'Trouser', 'Raw Trench'];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Search container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-3xl mx-auto mt-20 px-6 sm:px-8 z-10"
          >
            <div className="bg-charcoal border border-white/10 p-6 sm:p-8 rounded-none shadow-2xl space-y-6">
              {/* Input row */}
              <div className="flex items-center gap-4 border-b border-white/15 pb-4">
                <Search className="w-6 h-6 text-muted-light" />
                <input
                  type="text"
                  placeholder={t.search.placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-bone placeholder:text-muted/60 text-xs sm:text-base font-sans uppercase tracking-normal sm:tracking-wider focus:outline-none placeholder:truncate min-w-0"
                />
                <button
                  onClick={closeSearch}
                  className="p-1.5 text-muted hover:text-bone transition-colors"
                  aria-label={t.search.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Suggestion Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-muted uppercase tracking-widest mr-2">{t.search.popular}</span>
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    aria-label={`Search for ${tag}`}
                    className="text-[11px] uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 text-muted-light hover:text-bone transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto pt-2 space-y-3">
                {query.trim() && filteredProducts.length === 0 ? (
                  <div className="text-center py-10 text-muted text-xs tracking-wider">
                    {t.search.noResults} &quot;{query.toUpperCase()}&quot;
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      onClick={closeSearch}
                      className="flex items-center justify-between p-3 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-14 object-cover bg-obsidian"
                        />
                        <div>
                          <h4 className="text-xs font-semibold tracking-wider font-display text-bone group-hover:text-accent-lime transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-[11px] text-muted tracking-widest uppercase">
                            {product.category} • {product.collection}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-bone">
                          {formatIDR(product.price)}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent-lime transition-colors" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
