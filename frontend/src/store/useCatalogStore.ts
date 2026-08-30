import { create } from 'zustand';
import { Collection, COLLECTIONS } from '@/data/collections';
import { Product, PRODUCTS } from '@/data/products';
import { apiGetCollections, apiGetProducts, mapApiProductToFrontend } from '@/lib/api';

interface CatalogState {
  collections: Collection[];
  products: Product[];
  isLoading: boolean;
  isInitialized: boolean;
  fetchCatalog: (language: string) => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  collections: COLLECTIONS,
  products: PRODUCTS,
  isLoading: true,
  isInitialized: false,

  fetchCatalog: async (language: string) => {
    try {
      set({ isLoading: !get().isInitialized });

      const [colRes, prodRes] = await Promise.all([
        apiGetCollections(language),
        apiGetProducts({ lang: language }),
      ]);

      const stateUpdate: Partial<CatalogState> = {
        isLoading: false,
        isInitialized: true,
      };

      if (colRes.data && Array.isArray(colRes.data) && colRes.data.length > 0) {
        stateUpdate.collections = colRes.data.map((c) => {
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
      }

      const rawProdList = Array.isArray((prodRes.data as any)?.data)
        ? (prodRes.data as any).data
        : Array.isArray((prodRes.data as any)?.items)
        ? (prodRes.data as any).items
        : Array.isArray(prodRes.data)
        ? prodRes.data
        : null;

      if (rawProdList && rawProdList.length > 0) {
        stateUpdate.products = rawProdList.map(mapApiProductToFrontend);
      }

      set(stateUpdate as any);
    } catch (err) {
      console.error('Catalog fetch error:', err);
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
