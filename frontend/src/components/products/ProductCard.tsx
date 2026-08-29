import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Plus, Check, ArrowUpRight } from 'lucide-react';
import { Product } from '@/data/products';
import { formatIDR } from '@/lib/formatters';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/i18n/useTranslation';

interface ProductCardProps {
  product: Product;
  aspect?: 'portrait' | 'square' | 'tall' | 'editorial';
  index?: number;
  featured?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  aspect = 'portrait',
  index = 0,
  featured = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeColor, setActiveColor] = useState(product.colors[0]?.name || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const token = useAuthStore((state) => state.token);
  const openCart = useUIStore((state) => state.openCart);
  const { t } = useTranslation();

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent, sizeChoice?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const chosenSize = sizeChoice || selectedSize || product.sizes[0] || 'M';
    addItem(product, activeColor, chosenSize, 1, token);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      openCart();
    }, 550);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, token);
  };

  const aspectClass =
    aspect === 'tall'
      ? 'aspect-[3/4]'
      : aspect === 'square'
      ? 'aspect-square'
      : aspect === 'editorial'
      ? 'aspect-[4/5] sm:aspect-[3/4]'
      : 'aspect-[4/5]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.08, 0.3), ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setSelectedSize(null);
      }}
      className={`group relative flex flex-col justify-between select-none ${
        featured ? 'ring-1 ring-white/10 p-2 sm:p-3 bg-charcoal/30' : ''
      } ${className}`}
    >
      {/* Visual Image Container */}
      <div
        className={`relative w-full ${aspectClass} overflow-hidden bg-charcoal-dark border border-white/10 group-hover:border-white/25 transition-all duration-500 shadow-xl`}
      >
        <Link to={`/products/${product.slug}`} className="block w-full h-full relative overflow-hidden">
          {/* Primary Front Image */}
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover object-center transform transition-all duration-700 ease-out ${
              isHovered && product.images[1]
                ? 'opacity-0 scale-105'
                : 'opacity-100 scale-100 group-hover:scale-105'
            }`}
          />

          {/* Secondary Back/Editorial Image (Crossfade on Hover) */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover object-center transform transition-all duration-700 ease-out ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          )}
        </Link>

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.newArrival && (
            <span className="bg-bone text-obsidian text-[8px] sm:text-[10px] uppercase font-mono font-bold tracking-[0.2em] px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-md">
              NEW DROP
            </span>
          )}
          <span className="bg-black/70 backdrop-blur-md text-accent-lime text-[8px] sm:text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 border border-white/15">
            SERIES {product.collection}
          </span>
        </div>

        {/* Top Right Wishlist Toggle */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all duration-300 active:scale-95 ${
            isFavorited
              ? 'bg-accent-lime text-obsidian shadow-[0_0_15px_rgba(216,255,0,0.5)] scale-110'
              : 'bg-black/50 text-bone hover:bg-black/80 hover:text-accent-lime border border-white/10 hover:border-accent-lime/40'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform ${isFavorited ? 'fill-current scale-110' : ''}`} />
        </button>

        {/* Bottom Quick-Action Panel on Hover / Touch */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 space-y-1 sm:space-y-2">
          {/* Quick Size Ribbon */}
          <div className="flex items-center justify-between gap-1 p-1 bg-black/90 backdrop-blur-md border border-white/15">
            <span className="text-[8px] sm:text-[9px] font-mono text-muted pl-1 uppercase tracking-wider hidden xs:inline shrink-0">
              {t.productCard.size}
            </span>
            <div className="flex gap-1 flex-1 justify-end">
              {product.sizes.slice(0, 4).map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(sz);
                    handleQuickAdd(e, sz);
                  }}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8.5px] sm:text-[10px] font-mono font-bold uppercase bg-white/10 hover:bg-accent-lime hover:text-obsidian text-bone transition-colors active:scale-95 shrink-0"
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className="w-full py-2 sm:py-2.5 bg-bone text-obsidian hover:bg-accent-lime text-[8.5px] xs:text-[9px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.2em] font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 shadow-lg active:scale-98 text-center whitespace-nowrap"
          >
            {addedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-obsidian shrink-0" />
                <span>{t.productCard.added}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>{t.productCard.quickAdd}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Metadata & Hierarchy */}
      <div className="pt-3 sm:pt-4 pb-2 space-y-1 sm:space-y-1.5">
        {/* Category & Color Swatches */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-muted tracking-widest uppercase min-w-0">
          <span className="text-muted-light truncate mr-2">{product.category}</span>
          
          <div className="flex items-center gap-1.5 shrink-0">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveColor(c.name);
                }}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-all ${
                  activeColor === c.name
                    ? 'scale-125 border-accent-lime ring-1 ring-accent-lime'
                    : 'border-white/30 hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Product Title with consistent min-height */}
        <Link
          to={`/products/${product.slug}`}
          className="group/title flex items-start justify-between gap-2 text-xs sm:text-base font-bold tracking-tight font-display text-bone group-hover:text-accent-lime transition-colors min-h-[1.25rem] sm:min-h-[1.5rem]"
        >
          <span className="line-clamp-1">{product.name}</span>
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-accent-lime hidden sm:inline" />
        </Link>

        {/* Price & Material Preview */}
        <div className="flex items-baseline justify-between pt-0.5 min-w-0">
          <p className="text-xs sm:text-sm font-semibold font-sans text-bone tracking-wide shrink-0">
            {formatIDR(product.price)}
          </p>

          <span className="text-[9px] sm:text-[10px] font-mono text-muted tracking-wider uppercase hidden sm:inline truncate max-w-[120px] lg:max-w-[140px] pl-2">
            {product.details.material.split(',')[0]}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
