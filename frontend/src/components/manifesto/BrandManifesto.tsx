import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

export const BrandManifesto: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const { t, language } = useTranslation();

  const statementWords = t.manifesto.fashionWords;

  return (
    <section
      id="manifesto"
      ref={containerRef}
      className="py-28 sm:py-36 md:py-44 bg-obsidian text-bone relative overflow-hidden border-b border-white/5"
    >
      {/* Editorial Decorative Grid Background */}
      <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-bone/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Marker */}
        <div className="flex items-center gap-4 mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-accent-lime font-mono">
            {t.manifesto.label}
          </span>
          <div className="h-[1px] w-16 bg-white/20" />
        </div>

        {/* Primary Statement with Staggered Word Reveal */}
        <div className="space-y-10 sm:space-y-14">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.15] sm:leading-[1.1] tracking-tight text-bone max-w-5xl">
            {statementWords.map((word, idx) => {
              const isEmphasized =
                language === 'id'
                  ? word === 'menentukan' || word === 'sendiri.'
                  : word === 'defining' || word === 'form.';

              return (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: idx * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`inline-block mr-[0.3em] ${
                    isEmphasized
                      ? 'italic font-normal text-bone underline decoration-accent-lime decoration-1 underline-offset-8'
                      : ''
                  }`}
                >
                  {word}
                </motion.span>
              );
            })}
          </h2>

          {/* Supporting Statement in Dual Column Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 border-t border-white/10 items-start">
            <div className="md:col-span-5">
              <span className="block text-xs uppercase tracking-[0.3em] text-muted mb-2 font-mono">
                {t.manifesto.premiseLabel}
              </span>
              <p className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-bone leading-tight">
                {t.manifesto.premiseTitle}
              </p>
            </div>

            <div className="md:col-span-7 space-y-4">
              <p className="text-sm sm:text-base text-muted-light font-light leading-relaxed">
                {t.manifesto.premiseDesc}
              </p>
              <p className="text-xs text-muted tracking-wider uppercase font-mono">
                {t.manifesto.premiseSpecs}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
