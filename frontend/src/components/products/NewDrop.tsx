import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PRODUCTS, Product } from '@/data/products';
import { ProductCard } from './ProductCard';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import { apiGetProducts, mapApiProductToFrontend } from '@/lib/api';

export const NewDrop: React.FC = () => {
  const { t, getLocalizedProduct } = useTranslation();
  const { language } = useLanguageStore();
  const [liveProducts, setLiveProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    apiGetProducts({ lang: language }).then(({ data }) => {
      const rawList = Array.isArray((data as any)?.data)
        ? (data as any).data
        : (Array.isArray((data as any)?.items) ? (data as any).items : (Array.isArray(data) ? data : null));
      if (isMounted && rawList && rawList.length > 0) {
        setLiveProducts(rawList.map(mapApiProductToFrontend));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [language]);

  const rawNewArrivals = liveProducts.filter((p) => p.newArrival || p.featured).slice(0, 4);
  const newArrivals = rawNewArrivals.map(getLocalizedProduct);
  const heroProduct = newArrivals[0] || liveProducts[0];
  const supportingProducts = newArrivals.slice(1, 4);

  return (
    <section
      id="new-drop"
      className="py-24 sm:py-32 md:py-40 bg-obsidian text-bone relative border-b border-white/5 overflow-hidden select-none"
    >
      {/* Ambient Lighting Atmosphere */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-accent-lime/[0.025] rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-[0.3em] text-accent-lime font-mono">
                {t.newDrop.label}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[11px] font-mono tracking-widest text-muted uppercase">
                {t.newDrop.edition}
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight uppercase">
              {t.newDrop.title}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-bone hover:text-accent-lime transition-colors py-2"
            >
              <span>{t.newDrop.exploreAll.replace('{count}', String(PRODUCTS.length))}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform text-accent-lime" />
            </Link>
          </div>
        </div>

        {/* Editorial Asymmetrical Presentation (1 Anchor Hero + 3 Tiered Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Anchor Lead Card (Left 5 Columns) */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-1">
              <span className="text-[10px] font-mono tracking-widest text-accent-lime uppercase flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span>{t.newDrop.anchorTitle}</span>
              </span>
              <span className="text-[10px] font-mono text-muted uppercase">
                SERIES {heroProduct.collection}
              </span>
            </div>

            <ProductCard
              product={heroProduct}
              aspect="tall"
              index={0}
              featured={true}
              className="w-full"
            />
          </div>

          {/* Tiered Supporting Trio (Right 7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-1">
              <span className="text-[10px] font-mono tracking-widest text-muted uppercase">
                {t.newDrop.complementaryTitle}
              </span>
              <span className="text-[10px] font-mono text-muted uppercase">
                {t.newDrop.limitedArchive}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-6">
              {supportingProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className={`space-y-2 ${
                    idx === 1 ? 'sm:translate-y-4' : idx === 2 ? 'sm:translate-y-2' : ''
                  }`}
                >
                  <div className="text-[9px] font-mono text-muted tracking-widest uppercase pb-1 flex justify-between">
                    <span>0{idx + 2} // {product.collection}</span>
                    <span className="text-muted-dark font-sans">{t.newDrop.sizesCount.replace('{count}', String(product.sizes.length))}</span>
                  </div>

                  <ProductCard
                    product={product}
                    aspect="editorial"
                    index={idx + 1}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Editorial Banner / Atelier Note */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted font-mono">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-lime" />
            <span className="uppercase tracking-widest text-bone-soft">
              {t.newDrop.atelierNote}
            </span>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 uppercase tracking-[0.2em] text-accent-lime hover:text-bone transition-colors"
          >
            <span>{t.newDrop.viewCatalogue}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
