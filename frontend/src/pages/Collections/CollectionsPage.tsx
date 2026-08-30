import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { COLLECTIONS, Collection } from '@/data/collections';
import { PRODUCTS, Product } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import { apiGetCollections, apiGetProducts, mapApiProductToFrontend } from '@/lib/api';

export const CollectionsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { t, getLocalizedCollection, getLocalizedProduct } = useTranslation();
  const { language } = useLanguageStore();

  const [liveCollections, setLiveCollections] = useState<Collection[]>(COLLECTIONS);
  const [liveProducts, setLiveProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [colRes, prodRes] = await Promise.all([
        apiGetCollections(language),
        apiGetProducts({ lang: language }),
      ]);

      if (isMounted) {
        if (colRes.data && Array.isArray(colRes.data) && colRes.data.length > 0) {
          const mappedCols: Collection[] = colRes.data.map((c) => {
            const fallback = COLLECTIONS.find(
              (fc) =>
                fc.id.toLowerCase() === c.slug.toLowerCase() ||
                fc.code.toLowerCase() === c.code.toLowerCase() ||
                fc.name.toLowerCase() === c.name.toLowerCase(),
            );
            return {
              id: c.slug || c.id,
              code: c.code || fallback?.code || '01',
              name: c.name || fallback?.name || c.code,
              description: c.description || fallback?.description || '',
              tagline: fallback?.tagline || 'Crafted series.',
              accentQuote: fallback?.accentQuote || 'Define your own form.',
              heroImage: c.coverImageUrl || fallback?.heroImage || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800',
              detailImage: fallback?.detailImage || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800',
              productCount: fallback?.productCount || 6,
              featuredSlug: fallback?.featuredSlug || 'oversized-form-jacket',
              materialSpec: fallback?.materialSpec || 'Curated Atelier Materials',
              silhouetteSpec: fallback?.silhouetteSpec || 'Sculptural Tailoring',
              paletteSpec: fallback?.paletteSpec || 'Obsidian • Raw Stone • Slate',
              location: fallback?.location || 'ATELIER NOVAE // ARCHIVE',
            };
          });
          setLiveCollections(mappedCols);
        }

        const rawProdList = Array.isArray((prodRes.data as any)?.data)
          ? (prodRes.data as any).data
          : (Array.isArray((prodRes.data as any)?.items) ? (prodRes.data as any).items : (Array.isArray(prodRes.data) ? prodRes.data : null));

        if (rawProdList && rawProdList.length > 0) {
          setLiveProducts(rawProdList.map(mapApiProductToFrontend));
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const rawSelectedCol = id
    ? liveCollections.find(
        (c) =>
          c.id.toLowerCase() === id.toLowerCase() ||
          c.code.toLowerCase() === id.toLowerCase() ||
          c.name.toLowerCase() === id.toLowerCase(),
      ) || liveCollections[0]
    : null;

  const selectedCol = rawSelectedCol ? getLocalizedCollection(rawSelectedCol) : null;

  return (
    <div className="pt-28 pb-32 bg-obsidian text-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-accent-lime font-mono block mb-2">
            {t.collectionsPage.archiveLabel}
          </span>
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight uppercase">
            {selectedCol ? `SERIES ${selectedCol.code} — ${selectedCol.name}` : t.collectionsPage.threePillars}
          </h1>
          <p className="text-sm text-muted-light mt-2 max-w-xl font-light">
            {selectedCol
              ? selectedCol.description
              : t.collectionsPage.threePillarsDesc}
          </p>
        </div>

        {/* If viewing a single collection, show its hero + products */}
        {selectedCol ? (
          <div className="space-y-16">
            <div className="aspect-[16/8] sm:aspect-[21/9] bg-charcoal relative overflow-hidden border border-white/10">
              <img
                src={selectedCol.heroImage}
                alt={selectedCol.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
                <span className="text-xs font-mono tracking-widest text-accent-lime uppercase block mb-1">
                  SERIES {selectedCol.code}
                </span>
                <h2 className="text-3xl sm:text-5xl font-display font-black uppercase text-bone">
                  {selectedCol.name}
                </h2>
                <p className="text-sm font-serif italic text-bone-soft mt-1">
                  &quot;{selectedCol.accentQuote}&quot;
                </p>
              </div>
            </div>

            {/* Products in this collection */}
            <div>
              <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-8">
                {t.collectionsPage.piecesInSeries}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {liveProducts
                  .filter(
                    (p) =>
                      p.collection.toLowerCase() === selectedCol.name.toLowerCase() ||
                      p.collection.toLowerCase() === selectedCol.code.toLowerCase(),
                  )
                  .map((product) => (
                    <ProductCard key={product.id} product={getLocalizedProduct(product)} />
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* All 3 collections overview */
          <div className="space-y-24">
            {liveCollections.map((rawCol) => {
              const col = getLocalizedCollection(rawCol);
              return (
                <div key={col.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center border-b border-white/10 pb-20 last:border-0">
                  <div className="lg:col-span-6 aspect-[4/3] bg-charcoal overflow-hidden border border-white/10">
                    <img
                      src={col.heroImage}
                      alt={col.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="lg:col-span-6 space-y-6">
                    <span className="text-xs font-mono tracking-[0.3em] text-accent-lime uppercase">
                      SERIES {col.code}
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight uppercase">
                      {col.name}
                    </h2>
                    <p className="text-sm sm:text-base text-muted-light font-light leading-relaxed">
                      {col.description}
                    </p>
                    <p className="text-sm font-serif italic text-bone-soft">
                      &quot;{col.accentQuote}&quot;
                    </p>
                    <div className="pt-4">
                      <Link
                        to={`/collections/${col.id}`}
                        className="inline-flex items-center gap-3 bg-bone hover:bg-accent-lime text-obsidian px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                      >
                        <span>{t.collectionsPage.exploreCapsule.replace('{name}', col.name)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
