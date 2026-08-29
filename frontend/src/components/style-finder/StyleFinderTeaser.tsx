import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, ShoppingBag, Check, Layers, Compass } from 'lucide-react';
import { PRODUCTS, Product } from '@/data/products';
import { formatIDR } from '@/lib/formatters';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';

export const StyleFinderTeaser: React.FC = () => {
  const [style, setStyle] = useState<string>('minimal');
  const [fit, setFit] = useState<string>('oversized');
  const [palette, setPalette] = useState<string>('monochrome');
  const [step, setStep] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const { t, getLocalizedProduct } = useTranslation();

  const styleOptions = t.styleFinder.styleOpts;
  const fitOptions = t.styleFinder.fitOpts;
  const paletteOptions = t.styleFinder.paletteOpts;

  // Recommendation engine as per PRD §25
  const rankedProducts = useMemo(() => {
    const scored = PRODUCTS.map((prod) => {
      let score = 0;
      if (prod.tags.includes(style)) score += 3;
      if (prod.tags.includes(fit)) score += 3;
      if (prod.tags.includes(palette)) score += 2;
      if (prod.details.fit.toLowerCase().includes(fit)) score += 2;
      return { prod, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [style, fit, palette]);

  const rawRecommended: Product = rankedProducts[0]?.prod || PRODUCTS[0];
  const recommendedProduct: Product = getLocalizedProduct(rawRecommended);
  const complementaryProducts: Product[] = rankedProducts.slice(1, 3).map((item) => getLocalizedProduct(item.prod));

  // Formulated Archetype Persona
  const archetypeProfile = useMemo(() => {
    if (style === 'minimal' && (fit === 'oversized' || fit === 'structured')) {
      return {
        title: t.styleFinder.archetypes.minimalist.title,
        dossierCode: 'ARCH-MIN-01',
        philosophy: t.styleFinder.archetypes.minimalist.philosophy,
        keyPillars: t.styleFinder.archetypes.minimalist.pillars,
      };
    } else if (style === 'avant-garde') {
      return {
        title: t.styleFinder.archetypes.sculptor.title,
        dossierCode: 'RAD-SCULPT-03',
        philosophy: t.styleFinder.archetypes.sculptor.philosophy,
        keyPillars: t.styleFinder.archetypes.sculptor.pillars,
      };
    } else if (style === 'street' || fit === 'relaxed') {
      return {
        title: t.styleFinder.archetypes.urbanite.title,
        dossierCode: 'KIN-URBAN-02',
        philosophy: t.styleFinder.archetypes.urbanite.philosophy,
        keyPillars: t.styleFinder.archetypes.urbanite.pillars,
      };
    } else {
      return {
        title: t.styleFinder.archetypes.refiner.title,
        dossierCode: 'MOD-REFINE-04',
        philosophy: t.styleFinder.archetypes.refiner.philosophy,
        keyPillars: t.styleFinder.archetypes.refiner.pillars,
      };
    }
  }, [style, fit, t]);

  const handleAddPiece = (prod: Product, sizeChoice?: string) => {
    addItem(prod, prod.colors[0]?.name, sizeChoice || selectedSize || prod.sizes[0] || 'M', 1);
    openCart();
  };

  const handleReset = () => {
    setStyle('minimal');
    setFit('oversized');
    setPalette('monochrome');
    setStep(1);
  };

  const progressPercent = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <section
      id="style-finder"
      className="py-20 sm:py-28 md:py-36 bg-obsidian text-bone relative border-b border-white/5 overflow-hidden select-none"
    >
      {/* Ambient Atmospheric Lighting */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-bone/[0.02] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent-lime/[0.035] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-[0.3em] text-accent-lime">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.styleFinder.label}</span>
          </div>
          {/* Kept in English as required */}
          <h2 className="text-3xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight uppercase">
            FIND YOUR FORM
          </h2>
          <p className="text-xs sm:text-sm text-muted-light font-light leading-relaxed max-w-xl mx-auto">
            {t.styleFinder.desc}
          </p>
        </div>

        {/* Interactive Finder Container */}
        <div className="max-w-5xl mx-auto bg-charcoal/90 backdrop-blur-md border border-white/10 p-5 sm:p-10 lg:p-12 shadow-2xl relative">
          
          {/* Top Progress Bar */}
          <div className="w-full bg-white/10 h-1 mb-6 sm:mb-8 relative overflow-hidden">
            <motion.div
              className="h-full bg-accent-lime shadow-[0_0_12px_rgba(216,255,0,0.6)]"
              initial={{ width: '25%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Steps Indicator Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-5 sm:pb-6 mb-6 sm:mb-8">
            <div className="flex gap-2 sm:gap-3">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`text-xs font-mono tracking-widest px-3 py-1 sm:px-3.5 sm:py-1.5 border transition-all duration-300 ${
                    step === s
                      ? 'bg-bone text-obsidian border-bone font-bold shadow-md'
                      : s < step
                      ? 'bg-white/10 text-accent-lime border-accent-lime/40'
                      : 'text-muted border-white/10 hover:border-white/25'
                  }`}
                >
                  {s === 4 ? t.styleFinder.dossierBtn : `0${s}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-muted uppercase">
              <Compass className="w-3.5 h-3.5 text-accent-lime shrink-0" />
              <span>
                {step === 1 && t.styleFinder.signal1}
                {step === 2 && t.styleFinder.signal2}
                {step === 3 && t.styleFinder.signal3}
                {step === 4 && t.styleFinder.signal4}
              </span>
            </div>
          </div>

          {/* Step Views Animated Transitions */}
          <AnimatePresence mode="wait">
            
            {/* Step 1: Style */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5 sm:space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-lime">
                    {t.styleFinder.q1Of}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-display font-bold tracking-tight text-bone">
                    {t.styleFinder.q1Title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {styleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStyle(opt.value);
                        setStep(2);
                      }}
                      className={`group text-left p-4 sm:p-6 border transition-all duration-300 relative active:scale-99 h-full flex flex-col justify-between ${
                        style === opt.value
                          ? 'border-accent-lime bg-accent-lime/10 text-bone shadow-[0_0_25px_rgba(216,255,0,0.15)]'
                          : 'border-white/10 bg-black/40 hover:border-white/30 text-bone-soft'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-muted uppercase group-hover:text-accent-lime transition-colors">
                            {opt.tag}
                          </span>
                          {style === opt.value && (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent-lime text-obsidian flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <span className="block text-base sm:text-xl font-bold font-display tracking-wider uppercase mb-0.5 sm:mb-1 text-bone">
                          {opt.label}
                        </span>
                      </div>
                      <span className="block text-[11px] sm:text-xs text-muted-light font-light leading-relaxed mt-2">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Fit */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5 sm:space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-lime">
                    {t.styleFinder.q2Of}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-display font-bold tracking-tight text-bone">
                    {t.styleFinder.q2Title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {fitOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFit(opt.value);
                        setStep(3);
                      }}
                      className={`group text-left p-4 sm:p-6 border transition-all duration-300 relative active:scale-99 h-full flex flex-col justify-between ${
                        fit === opt.value
                          ? 'border-accent-lime bg-accent-lime/10 text-bone shadow-[0_0_25px_rgba(216,255,0,0.15)]'
                          : 'border-white/10 bg-black/40 hover:border-white/30 text-bone-soft'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-muted uppercase group-hover:text-accent-lime transition-colors">
                            {opt.tag}
                          </span>
                          {fit === opt.value && (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent-lime text-obsidian flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <span className="block text-base sm:text-xl font-bold font-display tracking-wider uppercase mb-0.5 sm:mb-1 text-bone">
                          {opt.label}
                        </span>
                      </div>
                      <span className="block text-[11px] sm:text-xs text-muted-light font-light leading-relaxed mt-2">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Palette */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5 sm:space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-lime">
                    {t.styleFinder.q3Of}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-display font-bold tracking-tight text-bone">
                    {t.styleFinder.q3Title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {paletteOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setPalette(opt.value);
                        setStep(4);
                      }}
                      className={`group text-left p-4 sm:p-6 border transition-all duration-300 relative active:scale-99 h-full flex flex-col justify-between ${
                        palette === opt.value
                          ? 'border-accent-lime bg-accent-lime/10 text-bone shadow-[0_0_25px_rgba(216,255,0,0.15)]'
                          : 'border-white/10 bg-black/40 hover:border-white/30 text-bone-soft'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-muted uppercase group-hover:text-accent-lime transition-colors">
                            {opt.tag}
                          </span>
                          {palette === opt.value && (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent-lime text-obsidian flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <span className="block text-base sm:text-xl font-bold font-display tracking-wider uppercase mb-0.5 sm:mb-1 text-bone">
                          {opt.label}
                        </span>
                      </div>
                      <span className="block text-[11px] sm:text-xs text-muted-light font-light leading-relaxed mt-2">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Personalized Style Dossier Result */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 sm:space-y-10"
              >
                {/* Dossier Header Banner */}
                <div className="bg-obsidian/90 p-5 sm:p-8 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
                  <div className="space-y-2 relative z-10 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-accent-lime text-obsidian text-[9px] sm:text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 uppercase shrink-0">
                        {archetypeProfile.dossierCode}
                      </span>
                      <span className="text-[11px] sm:text-xs font-mono tracking-widest text-muted uppercase truncate">
                        {t.styleFinder.dossierBadge}
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight uppercase text-bone">
                      {archetypeProfile.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-muted-light font-light max-w-xl leading-relaxed">
                      {archetypeProfile.philosophy}
                    </p>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                      {archetypeProfile.keyPillars.map((pillar) => (
                        <span
                          key={pillar}
                          className="bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-mono text-bone-soft px-2 py-0.5 sm:px-2.5 sm:py-1 tracking-wider whitespace-nowrap"
                        >
                          + {pillar}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="self-start md:self-center inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-mono text-muted hover:text-accent-lime transition-colors py-2 px-3 border border-white/10 hover:border-accent-lime/40 active:scale-95 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.styleFinder.recalibrate}</span>
                  </button>
                </div>

                {/* Primary Anchor Recommendation */}
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase tracking-[0.3em] text-accent-lime flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.styleFinder.primaryRec}</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center bg-black/60 p-5 sm:p-8 border border-white/10">
                    
                    {/* Visual Photo */}
                    <div className="md:col-span-5 aspect-[4/5] bg-obsidian overflow-hidden border border-white/10 relative group">
                      <img
                        src={recommendedProduct.images[0]}
                        alt={recommendedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 border border-white/15 text-[9px] font-mono text-accent-lime uppercase tracking-widest whitespace-nowrap">
                        {t.styleFinder.matchScore}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="md:col-span-7 space-y-4 sm:space-y-6 min-w-0">
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-muted uppercase tracking-widest">
                          <span>SERIES {recommendedProduct.collection}</span>
                          <span>•</span>
                          <span>{recommendedProduct.category}</span>
                        </div>

                        <h5 className="text-xl sm:text-3xl font-display font-black tracking-tight uppercase text-bone">
                          {recommendedProduct.name}
                        </h5>

                        <p className="text-sm sm:text-base font-semibold font-sans text-bone">
                          {formatIDR(recommendedProduct.price)}
                        </p>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-light leading-relaxed font-light">
                        {recommendedProduct.description}
                      </p>

                      {/* Size Selector Strip */}
                      <div className="space-y-2 pt-1 sm:pt-2">
                        <span className="text-[9px] sm:text-[10px] font-mono uppercase text-muted tracking-widest block">
                          {t.styleFinder.selectSize}
                        </span>
                        <div className="flex gap-2">
                          {recommendedProduct.sizes.map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setSelectedSize(sz)}
                              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-all active:scale-95 shrink-0 ${
                                selectedSize === sz
                                    ? 'bg-accent-lime text-obsidian border-accent-lime'
                                    : 'bg-white/5 text-bone border-white/15 hover:border-white/40'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CTA Actions */}
                      <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <button
                          onClick={() => handleAddPiece(recommendedProduct)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-bone hover:bg-accent-lime text-obsidian px-5 sm:px-7 py-3.5 sm:py-4 font-bold text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-colors shadow-lg active:scale-98 text-center whitespace-nowrap"
                        >
                          <ShoppingBag className="w-4 h-4 shrink-0" />
                          <span>{t.styleFinder.addRec}</span>
                        </button>

                        <Link
                          to={`/products/${recommendedProduct.slug}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 border border-white/20 hover:border-white/60 text-bone text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-colors active:scale-98 text-center whitespace-nowrap"
                        >
                          <span>{t.styleFinder.fullSpecs}</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Complementary Capsule Ensemble */}
                {complementaryProducts.length > 0 && (
                  <div className="space-y-4 pt-5 sm:pt-6 border-t border-white/10">
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-muted block">
                      {t.styleFinder.complementary}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {complementaryProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex gap-3 sm:gap-4 p-3.5 sm:p-4 bg-black/40 border border-white/10 items-center justify-between group hover:border-white/25 transition-colors"
                        >
                          <div className="w-16 h-20 sm:w-20 sm:h-24 aspect-[4/5] bg-obsidian shrink-0 overflow-hidden border border-white/10">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                            <span className="text-[8px] sm:text-[9px] font-mono text-muted tracking-widest uppercase block">
                              SERIES {prod.collection}
                            </span>
                            <h6 className="text-xs sm:text-sm font-bold font-display uppercase tracking-tight text-bone truncate">
                              {prod.name}
                            </h6>
                            <p className="text-xs font-sans text-muted-light">
                              {formatIDR(prod.price)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddPiece(prod)}
                            className="p-2.5 sm:p-3 bg-white/10 hover:bg-accent-lime hover:text-obsidian text-bone transition-colors shrink-0 active:scale-90"
                            title="Quick Add Pairing"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
