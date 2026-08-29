import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Shield, Award } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-28 pb-32 bg-obsidian text-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="border-b border-white/10 pb-12 mb-16 max-w-4xl">
          <span className="text-xs uppercase tracking-[0.3em] text-accent-lime font-mono block mb-3">
            {t.aboutPage.label}
          </span>
          {/* Kept in English as required by rules */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight uppercase leading-tight">
            WEAR THE <br />
            <span className="font-serif italic font-normal text-bone-soft">UNEXPECTED</span>.
          </h1>
          <p className="text-base sm:text-lg text-muted-light mt-6 leading-relaxed font-light">
            {t.aboutPage.intro}
          </p>
        </div>

        {/* Big Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 items-center">
          <div className="md:col-span-7 aspect-[16/10] bg-charcoal overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1400&auto=format&fit=crop"
              alt="NOVAÉ Atelier"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-5 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight">
              {t.aboutPage.processTitle}
            </h3>
            <p className="text-sm text-muted-light leading-relaxed font-light">
              {t.aboutPage.processDesc}
            </p>
            <p className="text-xs font-mono text-muted uppercase tracking-widest">
              {t.aboutPage.processTags}
            </p>
          </div>
        </div>

        {/* 3 Core Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t border-white/10">
          <div className="p-8 bg-charcoal border border-white/10 space-y-4">
            <Compass className="w-6 h-6 text-accent-lime" />
            <h4 className="text-lg font-display font-bold uppercase tracking-tight">
              {t.aboutPage.commitments.c1Title}
            </h4>
            <p className="text-xs text-muted-light font-light leading-relaxed">
              {t.aboutPage.commitments.c1Desc}
            </p>
          </div>

          <div className="p-8 bg-charcoal border border-white/10 space-y-4">
            <Shield className="w-6 h-6 text-accent-lime" />
            <h4 className="text-lg font-display font-bold uppercase tracking-tight">
              {t.aboutPage.commitments.c2Title}
            </h4>
            <p className="text-xs text-muted-light font-light leading-relaxed">
              {t.aboutPage.commitments.c2Desc}
            </p>
          </div>

          <div className="p-8 bg-charcoal border border-white/10 space-y-4">
            <Award className="w-6 h-6 text-accent-lime" />
            <h4 className="text-lg font-display font-bold uppercase tracking-tight">
              {t.aboutPage.commitments.c3Title}
            </h4>
            <p className="text-xs text-muted-light font-light leading-relaxed">
              {t.aboutPage.commitments.c3Desc}
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-24 p-12 bg-charcoal-dark border border-white/10 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase">
            {t.aboutPage.ctaTitle}
          </h3>
          <p className="text-xs sm:text-sm text-muted-light max-w-md mx-auto">
            {t.aboutPage.ctaDesc}
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-bone hover:bg-accent-lime text-obsidian px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-colors"
            >
              <span>{t.aboutPage.ctaBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
