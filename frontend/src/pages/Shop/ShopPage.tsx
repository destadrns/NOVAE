import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/products/ProductCard';
import { useTranslation } from '@/i18n/useTranslation';
import { useCatalogStore } from '@/store/useCatalogStore';

export const ShopPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialCollection = searchParams.get('collection') || 'All';

  const liveProducts = useCatalogStore((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection);
  const [sortBy, setSortBy] = useState<string>('featured');
  const { t, getLocalizedProduct } = useTranslation();

  const categories = [
    { key: 'All', label: t.shop.categories.All },
    { key: 'Outerwear', label: t.shop.categories.Outerwear },
    { key: 'Tops', label: t.shop.categories.Tops },
    { key: 'Bottoms', label: t.shop.categories.Bottoms },
    { key: 'Accessories', label: t.shop.categories.Accessories },
  ];

  const collections = ['All', 'FORM', 'MOTION', 'IDENTITY'] as const;

  const filteredProducts = useMemo(() => {
    const matched = liveProducts
      .filter((p) => {
        const matchCat =
          selectedCategory === 'All' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchCol =
          selectedCollection === 'All' ||
          p.collection.toLowerCase() === selectedCollection.toLowerCase();
        return matchCat && matchCol;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });

    return matched.map(getLocalizedProduct);
  }, [liveProducts, selectedCategory, selectedCollection, sortBy, getLocalizedProduct]);

  return (
    <div className="pt-28 pb-32 bg-obsidian text-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Title */}
        <div className="border-b border-white/10 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-accent-lime font-mono block mb-2">
              {t.shop.label}
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight uppercase">
              {t.shop.title}
            </h1>
          </div>
          <span className="text-xs font-mono tracking-widest text-muted uppercase">
            {t.shop.showing.replace('{count}', String(filteredProducts.length)).replace('{total}', String(liveProducts.length))}
          </span>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 mb-12 border-b border-white/10 pb-6">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`text-[11px] sm:text-xs uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 border transition-all whitespace-nowrap ${
                  selectedCategory === cat.key
                    ? 'bg-bone text-obsidian border-bone font-bold shadow-md'
                    : 'bg-white/5 border-white/10 text-muted hover:text-bone hover:border-white/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Collection & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Collection Filter */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-muted shrink-0">
              <span className="hidden sm:inline">{t.shop.collectionLabel}</span>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="bg-charcoal border border-white/15 text-bone text-xs uppercase px-2.5 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:border-accent-lime"
              >
                {collections.map((col) => (
                  <option key={col} value={col}>
                    {t.shop.collections[col]}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-muted shrink-0">
              <span className="hidden sm:inline">{t.shop.sortLabel}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-charcoal border border-white/15 text-bone text-xs uppercase px-2.5 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:border-accent-lime"
              >
                <option value="featured">{t.shop.sortOptions.featured}</option>
                <option value="newest">{t.shop.sortOptions.newest}</option>
                <option value="price-low">{t.shop.sortOptions.priceLow}</option>
                <option value="price-high">{t.shop.sortOptions.priceHigh}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <h3 className="text-xl font-display font-semibold">{t.shop.noMatchTitle}</h3>
            <p className="text-xs text-muted">{t.shop.noMatchDesc}</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCollection('All');
              }}
              className="mt-4 px-6 py-2.5 bg-bone text-obsidian text-xs font-bold uppercase tracking-widest"
            >
              {t.shop.resetBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} aspect="portrait" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
