import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Sparkles, Compass } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from '@/i18n/useTranslation';

gsap.registerPlugin(ScrollTrigger);

export const CinematicHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!containerRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      if (isReduced) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.2,
        },
      });

      // Background image slow scale and parallax shift
      tl.to(
        imageRef.current,
        {
          scale: 1.15,
          yPercent: 14,
          ease: 'none',
          willChange: 'transform',
        },
        0
      );

      // Hero text subtle fade & upward drift
      if (textRef.current) {
        tl.to(
          textRef.current,
          {
            yPercent: -18,
            opacity: 0.2,
            ease: 'none',
          },
          0
        );
      }

      // Watermark shift
      if (watermarkRef.current) {
        tl.to(
          watermarkRef.current,
          {
            yPercent: -30,
            opacity: 0,
            ease: 'none',
          },
          0
        );
      }

      // Floating look badge parallax
      if (floatingBadgeRef.current) {
        tl.to(
          floatingBadgeRef.current,
          {
            yPercent: -45,
            xPercent: 10,
            ease: 'none',
          },
          0
        );
      }
    }, containerRef);

    // Mouse movement parallax via GSAP — direct DOM, no React re-renders
    if (!isReduced && window.innerWidth >= 1024 && imageWrapperRef.current && floatingBadgeRef.current) {
      const wrapperXTo = gsap.quickTo(imageWrapperRef.current, 'x', { duration: 0.4, ease: 'power2.out' });
      const wrapperYTo = gsap.quickTo(imageWrapperRef.current, 'y', { duration: 0.4, ease: 'power2.out' });
      const badgeXTo = gsap.quickTo(floatingBadgeRef.current, 'x', { duration: 0.5, ease: 'power2.out' });
      const badgeYTo = gsap.quickTo(floatingBadgeRef.current, 'y', { duration: 0.5, ease: 'power2.out' });

      const handleMouseMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 16;
        const ny = (e.clientY / window.innerHeight - 0.5) * 16;
        wrapperXTo(nx * 0.4);
        wrapperYTo(ny * 0.4);
        badgeXTo(-nx * 0.8);
        badgeYTo(-ny * 0.8);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      return () => {
        ctx.revert();
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100svh] min-h-[640px] flex items-center justify-center overflow-hidden bg-obsidian text-bone select-none"
    >
      {/* Background Architectural Watermark */}
      <div
        ref={watermarkRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1] overflow-hidden select-none will-change-transform"
      >
        <span className="text-[20vw] font-display font-black tracking-tighter text-white/[0.035] leading-none uppercase select-none">
          NOVAÉ
        </span>
      </div>

      {/* Cinematic Background Visual with Interactive Parallax */}
      <div
        ref={imageWrapperRef}
        className="absolute inset-0 overflow-hidden z-0 will-change-transform"
      >
        <img
          ref={imageRef}
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2200&auto=format&fit=crop"
          alt="NOVAÉ Editorial Campaign"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center brightness-[0.62] contrast-[1.18] scale-[1.03] will-change-transform"
        />

        {/* Ambient Dark Gradient & Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-obsidian/50" />
        <div className="absolute inset-0 bg-noise opacity-35 pointer-events-none" />
      </div>

      {/* Editorial Corner Coordinate Markers */}
      <div className="hidden lg:flex absolute top-28 left-12 z-10 items-center gap-2 text-[10px] font-mono text-muted tracking-widest uppercase">
        <Compass className="w-3 h-3 text-accent-lime" />
        <span>PARIS • MILAN • JAKARTA</span>
      </div>

      <div className="hidden lg:block absolute top-28 right-12 z-10 text-[10px] font-mono text-muted tracking-widest uppercase">
        {t.hero.archiveCode} <span className="text-bone">NV-2026-F1</span>
      </div>

      {/* Floating Look Capsule Teaser (Desktop) */}
      <div
        ref={floatingBadgeRef}
        className="hidden xl:flex absolute right-16 top-1/3 z-20 items-center gap-4 p-3 bg-black/60 backdrop-blur-md border border-white/15 text-left group hover:border-accent-lime/60 transition-all duration-300 shadow-2xl will-change-transform"
      >
        <div className="w-12 h-14 bg-obsidian overflow-hidden shrink-0 border border-white/10">
          <img
            src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=300&auto=format&fit=crop"
            alt="Look Capsule"
            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <div className="space-y-0.5 pr-2">
          <span className="text-[9px] font-mono text-accent-lime uppercase tracking-widest block">
            SERIES 01 // FORM
          </span>
          <span className="text-xs font-display font-bold uppercase text-bone tracking-wide block">
            OVERSIZED JACKET
          </span>
          <span className="text-[10px] text-muted font-sans font-light">
            EDITION 24 PIECES
          </span>
        </div>
      </div>

      {/* Main Content Container with Staggered Kinetic Typography */}
      <div
        ref={textRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col justify-between pt-28 sm:pt-32 pb-8 sm:pb-12 will-change-transform"
      >
        {/* Top Tagline / Category (Staggered Entrance 1) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 border border-white/15">
            <span className="w-1.5 h-1.5 bg-accent-lime rounded-full animate-ping" />
            <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-mono font-medium text-bone/95">
              AUTUMN / WINTER 2026 CAPSULE
            </span>
          </div>
          <div className="hidden sm:block h-[1px] w-12 bg-white/20" />
          <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-muted uppercase">
            FORM • MOTION • IDENTITY
          </span>
        </motion.div>

        {/* Main Headline & CTA Block (Staggered Entrance 2 & 3) */}
        <div className="space-y-5 sm:space-y-8">
          <div className="space-y-1.5 sm:space-y-2">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="block text-[11px] sm:text-sm uppercase tracking-[0.35em] sm:tracking-[0.45em] text-accent-lime font-mono font-semibold"
            >
              DIGITAL FASHION EXPERIENCE
            </motion.span>

            {/* Main Headline with Masked Typography - Kept in EN as required */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black tracking-tight text-bone uppercase leading-[0.9] drop-shadow-2xl"
              >
                WEAR <br />
                <span className="font-serif italic font-normal text-bone-soft tracking-normal">THE</span> <br />
                <span className="text-stroke-bold text-bone hover:text-accent-lime transition-colors duration-500">
                  UNEXPECTED<span className="text-accent-lime">.</span>
                </span>
              </motion.h1>
            </div>
          </div>

          {/* Action Button Row (Staggered Entrance 4) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-1 sm:pt-2"
          >
            {/* Primary Action Button */}
            <Link
              to="/collections"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 sm:gap-4 bg-bone hover:bg-accent-lime text-obsidian px-5 sm:px-8 py-3.5 sm:py-4 font-bold text-xs uppercase tracking-[0.16em] sm:tracking-[0.25em] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_rgba(216,255,0,0.3)] active:scale-98 text-center whitespace-nowrap"
            >
              <span>{t.hero.exploreCta}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform shrink-0" />
            </Link>

            {/* Secondary Action Button */}
            <Link
              to="/style-finder"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-5 sm:px-7 py-3.5 sm:py-4 border border-white/20 hover:border-accent-lime/70 bg-black/40 backdrop-blur-md text-bone text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-all duration-300 hover:bg-black/60 active:scale-98 text-center whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-lime group-hover:rotate-12 transition-transform duration-300 shrink-0" />
              <span>FIND YOUR FORM</span>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Editorial Scroll Bar (Staggered Entrance 5) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex items-center justify-between text-[10px] sm:text-xs tracking-[0.16em] sm:tracking-[0.25em] text-muted border-t border-white/10 pt-3.5 sm:pt-4"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="w-1.5 h-1.5 bg-accent-lime rounded-full shrink-0" />
            <span className="font-mono truncate">{t.hero.archiveBadge}</span>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('manifesto');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-muted hover:text-bone transition-colors group cursor-pointer font-mono shrink-0 pl-2"
            aria-label="Scroll down to Manifesto"
          >
            <span className="tracking-widest hidden xs:inline">{t.hero.scroll}</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce text-accent-lime group-hover:translate-y-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
