import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, ArrowLeft } from 'lucide-react';
import { PRODUCTS, Product } from '@/data/products';
import { formatIDR } from '@/lib/formatters';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { ProductCard } from '@/components/products/ProductCard';
import { useTranslation } from '@/i18n/useTranslation';
import { apiGetProductBySlug, mapApiProductToFrontend } from '@/lib/api';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const storeProducts = useCatalogStore((state) => state.products);
  const matchedFromStore = storeProducts.find((p) => p.slug === slug);
  const fallbackProduct = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
  const initialProduct = matchedFromStore || fallbackProduct;

  const [rawProduct, setRawProduct] = useState<Product>(initialProduct);
  const { t, getLocalizedProduct } = useTranslation();
  const { language } = useLanguageStore();
  const product = getLocalizedProduct(rawProduct);

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { token, isAuthenticated, openAuthModal } = useAuthStore();

  // Scroll to top and immediately sync when slug or language changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const matched =
      storeProducts.find((p) => p.slug === slug) ||
      PRODUCTS.find((p) => p.slug === slug);

    if (matched) {
      setRawProduct(matched);
      if (matched.colors && matched.colors[0]) {
        setSelectedColor(matched.colors[0].name);
      }
      if (matched.sizes && matched.sizes[0]) {
        setSelectedSize(matched.sizes[0]);
      }
    }

    setSelectedImage(0);
    setIsAdding(false);
    setJustAdded(false);

    let isMounted = true;
    if (slug) {
      apiGetProductBySlug(slug, language).then(({ data }) => {
        if (isMounted && data) {
          const mapped = mapApiProductToFrontend(data);
          setRawProduct(mapped);
          if (mapped.colors && mapped.colors[0]) {
            setSelectedColor(mapped.colors[0].name);
          }
          if (mapped.sizes && mapped.sizes[0]) {
            setSelectedSize(mapped.sizes[0]);
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [slug, language, storeProducts]);

  // Calculate dynamic active price (support variant price override)
  const activeVariant = (rawProduct as any).variants?.find(
    (v: any) =>
      v.colorName?.toLowerCase() === selectedColor.toLowerCase() &&
      v.size?.toLowerCase() === selectedSize.toLowerCase(),
  );
  const displayPrice = activeVariant?.priceOverrideIdr
    ? Number(activeVariant.priceOverrideIdr)
    : product.price;

  const isFavorited = isInWishlist(product.id);
  const relatedProducts = storeProducts
    .filter((p) => p.slug !== slug && p.id !== product.id)
    .slice(0, 3)
    .map(getLocalizedProduct);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openAuthModal(
        'signin',
        language === 'id'
          ? 'Silakan masuk ke akun NOVAÉ Anda untuk menambahkan item ini ke tas belanja dan mengamankan alokasi stok eksklusif.'
          : 'Please sign in to your NOVAÉ account to add this item to your shopping bag and secure limited stock allocation.'
      );
      return;
    }

    setIsAdding(true);
    setTimeout(() => {
      addItem(rawProduct, selectedColor, selectedSize, 1, token);
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        openCart();
      }, 700);
    }, 400);
  };

  const currentMainImage =
    product.images && product.images[selectedImage]
      ? product.images[selectedImage]
      : product.images && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800';

  return (
    <div className="pt-28 pb-32 bg-obsidian text-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-muted hover:text-bone transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.productDetail.backLink}</span>
          </Link>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-20 border-b border-white/10">
          {/* Gallery Column (7 cols) - Sticky & Smooth */}
          <div className="lg:col-span-7 lg:sticky lg:top-28 self-start space-y-4">
            {/* Primary Large Image */}
            <div className="aspect-[4/5] bg-charcoal-dark border border-white/10 overflow-hidden relative group">
              <img
                key={`${product.id}-${selectedImage}`}
                src={currentMainImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-opacity duration-300"
              />
              <div className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur-md px-3 py-1 text-[10px] font-mono tracking-widest uppercase border border-white/10">
                SERIES {product.collection}
              </div>
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-[4/5] bg-charcoal-dark border overflow-hidden transition-all ${
                      selectedImage === idx
                        ? 'border-accent-lime ring-1 ring-accent-lime'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Category & Name & Price */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-[0.3em] text-accent-lime">
                  {product.category} • {product.collection}
                </span>
                <span className="text-[11px] font-mono tracking-widest text-muted uppercase">
                  {t.productDetail.inStock.replace('{stock}', String(product.stock))}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight uppercase">
                {product.name}
              </h1>

              <p className="text-xl sm:text-2xl font-bold font-sans tracking-wide text-bone">
                {formatIDR(displayPrice)}
              </p>
            </div>

            {/* Tagline & Description */}
            <div className="space-y-3 text-xs sm:text-sm text-muted-light leading-relaxed font-light border-y border-white/10 py-6">
              <p className="font-serif italic text-bone-soft text-base">
                &quot;{product.tagline}&quot;
              </p>
              <p>{product.description}</p>
            </div>

            {/* Color Swatches */}
            <div className="space-y-3">
              <label className="block text-xs uppercase font-mono tracking-widest text-muted">
                {t.productDetail.colorLabel} <span className="text-bone font-bold">{selectedColor}</span>
              </label>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    aria-label={`Select color ${c.name}`}
                    className={`group flex items-center gap-2 px-3 py-2 border text-xs tracking-wider uppercase transition-all ${
                      selectedColor === c.name
                        ? 'border-accent-lime bg-accent-lime/10 text-bone'
                        : 'border-white/15 bg-black/30 text-muted hover:text-bone hover:border-white/30'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/30"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono tracking-widest text-muted">
                <span>{t.productDetail.sizeLabel}</span>
                <button className="underline hover:text-bone transition-colors">
                  {t.productDetail.sizeGuide}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    aria-label={`Select size ${s}`}
                    className={`py-3 text-xs font-bold font-mono tracking-widest border transition-all ${
                      selectedSize === s
                        ? 'bg-bone text-obsidian border-bone'
                        : 'bg-white/5 border-white/10 text-muted hover:border-white/30 hover:text-bone'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-4 bg-bone hover:bg-accent-lime text-obsidian text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-obsidian" />
                    <span>{t.productDetail.addedBtn}</span>
                  </>
                ) : isAdding ? (
                  <span className="animate-pulse">{t.productDetail.addingBtn}</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.productDetail.addBtn}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product.id, token)}
                className={`w-full py-3 border text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                  isFavorited
                    ? 'border-accent-lime text-accent-lime bg-accent-lime/5'
                    : 'border-white/20 text-muted hover:text-bone hover:border-white/50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                <span>{isFavorited ? t.productDetail.savedWishlist : t.productDetail.saveWishlist}</span>
              </button>
            </div>

            {/* Material & Atelier Specs */}
            <div className="space-y-4 pt-4 border-t border-white/10 text-xs text-muted font-light">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-muted uppercase block text-[10px] mb-0.5">{t.productDetail.fabricSpec}</span>
                  <span className="text-bone-soft break-words leading-snug">{product.details.material}</span>
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-muted uppercase block text-[10px] mb-0.5">{t.productDetail.fitProfile}</span>
                  <span className="text-bone-soft break-words leading-snug">{product.details.fit}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="min-w-0">
                  <span className="font-mono text-muted uppercase block text-[10px] mb-0.5">{t.productDetail.care}</span>
                  <span className="text-bone-soft break-words leading-snug">{product.details.care}</span>
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-muted uppercase block text-[10px] mb-0.5">{t.productDetail.origin}</span>
                  <span className="text-bone-soft break-words leading-snug">{product.details.origin}</span>
                </div>
              </div>
            </div>

            {/* Service Perquisites */}
            <div className="border-t border-white/10 pt-6 grid grid-cols-1 xs:grid-cols-3 gap-2 text-center text-[9.5px] sm:text-[10px] font-mono text-muted uppercase tracking-wider">
              <div className="p-2.5 sm:p-2 border border-white/5 bg-white/2 flex xs:flex-col items-center justify-center gap-2 xs:gap-0 min-w-0">
                <Truck className="w-4 h-4 xs:mx-auto xs:mb-1.5 text-accent-lime shrink-0" />
                <span className="break-words leading-tight">{t.productDetail.perks.dispatch}</span>
              </div>
              <div className="p-2.5 sm:p-2 border border-white/5 bg-white/2 flex xs:flex-col items-center justify-center gap-2 xs:gap-0 min-w-0">
                <RefreshCw className="w-4 h-4 xs:mx-auto xs:mb-1.5 text-accent-lime shrink-0" />
                <span className="break-words leading-tight">{t.productDetail.perks.exchange}</span>
              </div>
              <div className="p-2.5 sm:p-2 border border-white/5 bg-white/2 flex xs:flex-col items-center justify-center gap-2 xs:gap-0 min-w-0">
                <ShieldCheck className="w-4 h-4 xs:mx-auto xs:mb-1.5 text-accent-lime shrink-0" />
                <span className="break-words leading-tight">{t.productDetail.perks.warranty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="pt-20">
          <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
              {t.productDetail.complementaryTitle}
            </h3>
            <Link to="/shop" className="text-xs uppercase font-mono tracking-widest text-muted hover:text-bone">
              {t.productDetail.viewAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
