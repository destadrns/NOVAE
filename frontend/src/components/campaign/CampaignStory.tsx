import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from '@/i18n/useTranslation';

gsap.registerPlugin(ScrollTrigger);

export const CampaignStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: 12,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-obsidian py-20 px-6 sm:px-8 lg:px-12"
    >
      {/* Editorial Background Photography */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imageRef}
          src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2000&auto=format&fit=crop"
          alt="Campaign Story FORM 01"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center brightness-[0.55] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-black/40 to-obsidian/70" />
      </div>

      {/* Editorial Centered Content Overlay */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-1.5 border border-white/15">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-lime" />
          <span className="text-xs uppercase font-mono tracking-[0.3em] text-bone">
            {t.campaign.badge}
          </span>
        </div>

        {/* Kept in English as required by rules */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-bone uppercase leading-[0.95]">
          BUILT <br />
          <span className="font-serif italic font-normal text-bone-soft">DIFFERENTLY</span>.
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-bone/80 font-light max-w-2xl mx-auto leading-relaxed">
          {t.campaign.desc}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            to="/journal/inside-novae-form-01"
            className="group inline-flex items-center gap-3 bg-bone hover:bg-accent-lime text-obsidian px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300"
          >
            <span>{t.campaign.readStory}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>

          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.25em] text-bone-soft hover:text-accent-lime border-b border-white/30 hover:border-accent-lime pb-1 transition-colors"
          >
            {t.campaign.exploreAll}
          </Link>
        </div>
      </div>
    </section>
  );
};
