import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export const FinalCTA: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-28 sm:py-40 bg-obsidian text-bone overflow-hidden flex items-center justify-center">
      {/* Background Photography with Heavy Dark Vignette */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop"
          alt="NOVAÉ Manifesto Background"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center brightness-[0.4] contrast-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-obsidian" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-8">
        <span className="text-xs uppercase tracking-[0.4em] text-accent-lime font-mono block">
          {t.finalCta.label}
        </span>

        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight uppercase leading-[0.95] max-w-4xl mx-auto">
          {t.finalCta.title1} <br />
          <span className="font-serif italic font-normal text-bone-soft">{t.finalCta.title2}</span> <br />
          {t.finalCta.title3}
        </h2>

        <p className="text-sm sm:text-base text-muted-light max-w-xl mx-auto font-light leading-relaxed">
          {t.finalCta.desc}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-6">
          <Link
            to="/shop"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 sm:gap-4 bg-bone hover:bg-accent-lime text-obsidian px-6 sm:px-10 py-3.5 sm:py-4 font-bold text-xs uppercase tracking-[0.16em] sm:tracking-[0.25em] transition-all duration-300 shadow-2xl text-center whitespace-nowrap"
          >
            <span>{t.finalCta.exploreCta}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform shrink-0" />
          </Link>

          <Link
            to="/style-finder"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border border-white/20 hover:border-white/60 bg-black/40 backdrop-blur-md text-bone text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-colors text-center whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-lime shrink-0" />
            <span>{t.finalCta.quizCta}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
