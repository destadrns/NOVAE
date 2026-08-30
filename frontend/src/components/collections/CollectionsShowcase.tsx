import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Compass, Eye } from 'lucide-react';
import { COLLECTIONS, Collection } from '@/data/collections';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import { apiGetCollections } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

export const CollectionsShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { t, getLocalizedCollection } = useTranslation();
  const { language } = useLanguageStore();
  const [liveCollections, setLiveCollections] = useState<Collection[]>(COLLECTIONS);

  useEffect(() => {
    let isMounted = true;
    apiGetCollections(language).then(({ data }) => {
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        const mappedCols: Collection[] = data.map((c) => {
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
    });
    return () => {
      isMounted = false;
    };
  }, [language]);

  const rawCollection = liveCollections[activeTab] || liveCollections[0] || COLLECTIONS[0];
  const currentCollection = getLocalizedCollection(rawCollection);

  const sectionRef = useRef<HTMLDivElement>(null);
  const visualContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !visualContainerRef.current) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      // Subtle scroll drift for the visual stage on desktop/tablet
      gsap.to(visualContainerRef.current, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="collections"
      className="py-20 sm:py-28 md:py-36 bg-charcoal-dark text-bone relative overflow-hidden border-b border-white/5 select-none"
    >
      {/* Ambient Lighting Atmosphere */}
      <div className="absolute inset-0 bg-noise opacity-35 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bone/[0.025] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-lime/[0.03] rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16 border-b border-white/10 pb-6 sm:pb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-accent-lime font-mono">
                {t.collections.label}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-muted uppercase">
                {t.collections.seriesOf.replace('{current}', String(activeTab + 1))}
              </span>
            </div>
            <h2 className="text-3xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight uppercase">
              {t.collections.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-light max-w-md font-sans font-light leading-relaxed">
            {t.collections.desc}
          </p>
        </div>

        {/* Collection Selector Tabs */}
        <div
          role="tablist"
          aria-label="NOVAÉ Collection Series"
          className="grid grid-cols-3 gap-1.5 sm:gap-4 mb-10 sm:mb-12 border-b border-white/10 pb-4"
        >
          {COLLECTIONS.map((col, index) => {
            const locCol = getLocalizedCollection(col);
            const isActive = activeTab === index;
            return (
              <button
                key={col.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`collection-panel-${col.id}`}
                id={`collection-tab-${col.id}`}
                onClick={() => setActiveTab(index)}
                className={`group text-left py-3 sm:py-4 px-1.5 sm:px-4 transition-all duration-300 relative focus:outline-none ${
                  isActive ? 'text-bone' : 'text-muted hover:text-bone-soft'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <span className="text-[9px] sm:text-[11px] font-mono tracking-widest uppercase transition-colors group-hover:text-accent-lime">
                    SERIES {col.code}
                  </span>
                  <span className="text-[9px] font-mono text-muted-dark hidden md:inline">
                    {t.collections.stylesCount.replace('{count}', String(col.productCount))}
                  </span>
                </div>
                <span className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-display font-black tracking-tight uppercase block">
                  {col.name}
                </span>
                <span className="text-[11px] text-muted-dark font-sans tracking-wider hidden lg:block mt-1 font-light truncate">
                  {locCol.tagline}
                </span>

                {/* Animated active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeCollectionTab"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-accent-lime shadow-[0_0_12px_rgba(216,255,0,0.5)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Interactive Feature Card & World Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCollection.id}
            id={`collection-panel-${currentCollection.id}`}
            role="tabpanel"
            aria-labelledby={`collection-tab-${currentCollection.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
          >
            {/* Visual Column (Dual-Plate Editorial Composition) */}
            <div
              ref={visualContainerRef}
              className="lg:col-span-7 relative group"
            >
              {/* Main Primary Plate */}
              <div className="relative aspect-[4/5] sm:aspect-[16/11] bg-obsidian overflow-hidden border border-white/10 shadow-2xl">
                <motion.img
                  key={`hero-${currentCollection.id}`}
                  initial={{ scale: 1.08, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  src={currentCollection.heroImage}
                  alt={currentCollection.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

                {/* Top Corner Archive Badge */}
                <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/15 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-accent-lime">
                  <Sparkles className="w-3 h-3" />
                  <span>SERIES {currentCollection.code} — {currentCollection.name}</span>
                </div>

                {/* Top Right Atelier Location */}
                <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10 text-[9px] font-mono tracking-widest uppercase text-muted">
                  <Compass className="w-3 h-3 text-bone" />
                  <span>{currentCollection.location}</span>
                </div>

                {/* Bottom Quote Inset */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-muted block mb-1">
                    {t.collections.designManifesto}
                  </span>
                  <p className="text-sm sm:text-xl font-serif italic text-bone leading-snug">
                    &quot;{currentCollection.accentQuote}&quot;
                  </p>
                </div>
              </div>

              {/* Secondary Floating Macro Inset Plate */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 lg:-right-8 w-44 lg:w-52 aspect-[3/4] bg-obsidian/95 backdrop-blur-md p-2 border border-accent-lime/40 shadow-2xl z-20 group-hover:translate-y-[-4px] transition-transform duration-500">
                <div className="w-full h-full overflow-hidden relative border border-white/10">
                  <motion.img
                    key={`detail-${currentCollection.id}`}
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    src={currentCollection.detailImage}
                    alt={`${currentCollection.name} detail view`}
                    className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 text-[8px] font-mono text-accent-lime tracking-widest uppercase">
                    {t.collections.macroSpec}
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Content Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              {/* Header block */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-lime" />
                  <span className="text-xs uppercase tracking-[0.3em] text-accent-lime font-mono font-semibold">
                    {currentCollection.tagline}
                  </span>
                </div>

                <div className="overflow-hidden">
                  <motion.h3
                    key={`title-${currentCollection.id}`}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-3xl sm:text-5xl lg:text-6xl font-display font-black uppercase tracking-tight text-bone"
                  >
                    {currentCollection.name}
                  </motion.h3>
                </div>
              </div>

              {/* Description */}
              <motion.p
                key={`desc-${currentCollection.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xs sm:text-base text-muted-light leading-relaxed font-light"
              >
                {currentCollection.description}
              </motion.p>

              {/* Technical Specifications Grid */}
              <motion.div
                key={`specs-${currentCollection.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4 sm:py-6 border-y border-white/10 text-xs font-mono"
              >
                <div className="min-w-0">
                  <span className="text-[10px] text-muted tracking-widest uppercase block mb-0.5 sm:mb-1">
                    {t.collections.materialSpec}
                  </span>
                  <span className="text-bone font-medium leading-snug block break-words">
                    {currentCollection.materialSpec}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] text-muted tracking-widest uppercase block mb-0.5 sm:mb-1">
                    {t.collections.silhouetteProfile}
                  </span>
                  <span className="text-bone font-medium leading-snug block break-words">
                    {currentCollection.silhouetteSpec}
                  </span>
                </div>

                <div className="pt-1 sm:pt-2 min-w-0">
                  <span className="text-[10px] text-muted tracking-widest uppercase block mb-0.5 sm:mb-1">
                    {t.collections.paletteAtmosphere}
                  </span>
                  <span className="text-bone font-medium leading-snug block break-words">
                    {currentCollection.paletteSpec}
                  </span>
                </div>

                <div className="pt-1 sm:pt-2 min-w-0">
                  <span className="text-[10px] text-muted tracking-widest uppercase block mb-0.5 sm:mb-1">
                    {t.collections.curatedVolume}
                  </span>
                  <span className="text-accent-lime font-bold leading-snug block">
                    {t.collections.piecesReleased.replace('{count}', String(currentCollection.productCount))}
                  </span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                key={`actions-${currentCollection.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
              >
                <Link
                  to={`/collections/${currentCollection.id}`}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-bone hover:bg-accent-lime text-obsidian px-5 sm:px-7 py-3.5 sm:py-4 font-bold text-xs uppercase tracking-[0.18em] sm:tracking-[0.25em] transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(216,255,0,0.25)] active:scale-98 text-center whitespace-nowrap"
                >
                  <span>{t.collections.viewCapsule.replace('{name}', currentCollection.name)}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform shrink-0" />
                </Link>

                <Link
                  to={`/products/${currentCollection.featuredSlug}`}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3.5 sm:py-4 border border-white/20 hover:border-accent-lime/60 bg-black/40 backdrop-blur-sm text-bone text-xs uppercase tracking-[0.16em] sm:tracking-[0.18em] transition-all duration-300 active:scale-98 text-center whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5 text-accent-lime shrink-0" />
                  <span>{t.collections.keyPiece}</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
