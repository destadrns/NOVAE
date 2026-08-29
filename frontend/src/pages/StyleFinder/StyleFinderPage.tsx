import React from 'react';
import { StyleFinderTeaser } from '@/components/style-finder/StyleFinderTeaser';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { useTranslation } from '@/i18n/useTranslation';

export const StyleFinderPage: React.FC = () => {
  const { t, getLocalizedProduct } = useTranslation();

  return (
    <div className="pt-24 pb-32 bg-obsidian text-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <StyleFinderTeaser />

        {/* All Catalog Preview */}
        <div className="mt-20 pt-16 border-t border-white/10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
              {t.shop.title}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={getLocalizedProduct(product)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
