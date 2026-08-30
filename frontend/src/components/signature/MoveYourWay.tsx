import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Activity, Compass } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from '@/i18n/useTranslation';

gsap.registerPlugin(ScrollTrigger);

export const MoveYourWay: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const textMoveRef = useRef<HTMLHeadingElement>(null);
  const textYourRef = useRef<HTMLHeadingElement>(null);
  const textWayRef = useRef<HTMLHeadingElement>(null);
  
  const plate1Ref = useRef<HTMLDivElement>(null);
  const plate2Ref = useRef<HTMLDivElement>(null);
  const plate3Ref = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const cadenceBadgeRef = useRef<HTMLDivElement>(null);

  // Direct DOM refs for scroll percent displays — avoids ~60 re-renders/sec
  const percentDisplay1Ref = useRef<HTMLElement>(null);
  const percentDisplay2Ref = useRef<HTMLElement>(null);
  const activeLookRef = useRef<number>(1);
  const [activeLook, setActiveLook] = useState<number>(1);
  const { t } = useTranslation();

  useEffect(() => {
    if (!sectionRef.current || !stageRef.current) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Main scroll timeline across the pinned/scrubbed section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.2,
          anticipatePin: 1,
          fastScrollEnd: true,
          onUpdate: (self) => {
            const pct = Math.round(self.progress * 100);
            // Direct DOM update — no React re-render
            if (percentDisplay1Ref.current) percentDisplay1Ref.current.textContent = `${pct}%`;
            if (percentDisplay2Ref.current) percentDisplay2Ref.current.textContent = `${pct}%`;
            // Only setState when activeLook actually changes (3 transitions total)
            const newLook = self.progress < 0.35 ? 1 : self.progress < 0.7 ? 2 : 3;
            if (newLook !== activeLookRef.current) {
              activeLookRef.current = newLook;
              setActiveLook(newLook);
            }
          },
        },
      });

      // Kinetic Typography Choreography
      // MOVE: Displaces leftward with letter-spacing dilation
      if (textMoveRef.current) {
        tl.to(
          textMoveRef.current,
          {
            xPercent: -15,
            letterSpacing: '0.03em',
            ease: 'power1.out',
          },
          0
        );
      }

      // YOUR: Hollow stroke layer travels in opposite direction (rightward) slicing through imagery
      if (textYourRef.current) {
        tl.to(
          textYourRef.current,
          {
            xPercent: 18,
            opacity: 0.9,
            ease: 'power1.out',
          },
          0
        );
      }

      // WAY: Bold lime statement pushes forward with slight upward elevation
      if (textWayRef.current) {
        tl.to(
          textWayRef.current,
          {
            xPercent: -22,
            yPercent: -8,
            scale: 1.03,
            ease: 'power1.out',
          },
          0
        );
      }

      // Image Plate 01: Drifts downward with subtle counter-rotation
      if (plate1Ref.current) {
        tl.to(
          plate1Ref.current,
          {
            yPercent: 35,
            xPercent: -12,
            rotate: -2.5,
            ease: 'power1.inOut',
          },
          0
        );
      }

      // Image Plate 02: Pushes upward into overlapping position with foreground typography
      if (plate2Ref.current) {
        tl.to(
          plate2Ref.current,
          {
            yPercent: -40,
            xPercent: 14,
            rotate: 2,
            ease: 'power1.inOut',
          },
          0
        );
      }

      // Micro Plate 03: Fast floating parallax accent
      if (plate3Ref.current) {
        tl.to(
          plate3Ref.current,
          {
            yPercent: -65,
            xPercent: -25,
            rotate: -5,
            ease: 'power2.out',
          },
          0
        );
      }

      // Progress bar scrub
      if (progressLineRef.current) {
        tl.to(
          progressLineRef.current,
          {
            scaleX: 1,
            ease: 'none',
          },
          0
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="move-your-way"
      className="relative w-full bg-obsidian text-bone overflow-hidden border-b border-white/5 select-none"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-lime/[0.04] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-bone/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Pinned Stage */}
      <div
        ref={stageRef}
        className="relative w-full h-[100svh] min-h-[580px] flex flex-col justify-between p-5 sm:p-10 lg:p-14 z-10 max-w-[1700px] mx-auto overflow-hidden"
      >
        {/* Top Editorial Telemetry Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4 sm:pb-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase font-mono tracking-[0.25em] sm:tracking-[0.3em] text-accent-lime">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.moveYourWay.label}</span>
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-xs font-mono tracking-widest text-muted uppercase hidden sm:inline">
              {t.moveYourWay.studyBadge}
            </span>
          </div>

          {/* Kinetic Progress & Coordinates Telemetry */}
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-mono tracking-widest text-muted">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-accent-lime animate-pulse" />
              <span>{t.moveYourWay.stageCadence} <strong ref={percentDisplay1Ref} className="text-bone">0%</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>LAT 06°54′S / LONG 107°36′E</span>
            </div>
          </div>
        </div>

        {/* Center Canvas: Interlocking Layered Typography and Floating Imagery */}
        <div className="relative flex-1 flex items-center justify-center my-auto overflow-hidden">
          
          {/* LAYER 0: Background Deep Plate (Plate 01) */}
          <div
            ref={plate1Ref}
            className="hidden sm:block absolute top-[6%] right-[8%] lg:right-[14%] w-48 sm:w-64 lg:w-80 aspect-[3/4] bg-obsidian z-10 shadow-2xl overflow-hidden border border-white/15 group cursor-pointer transition-transform duration-500 will-change-transform"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
              alt="Motion Silhouette in Flight"
              loading="lazy"
              className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase text-accent-lime border border-white/10">
              LOOK 01 / FLUID SHIRT
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-[10px] font-mono tracking-wider text-bone-soft">
              SANDWASHED ECO-CUPRO
            </div>
          </div>

          {/* LAYER 1: Giant Kinetic Typography (Back & Front Weave) */}
          <div className="relative z-20 w-full max-w-7xl mx-auto space-y-1 sm:space-y-4 md:space-y-6 font-display font-black tracking-tight uppercase leading-[0.85] select-none pointer-events-none">
            
            {/* ROW 1: MOVE */}
            <div className="overflow-visible">
              <h2
                ref={textMoveRef}
                className="text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[150px] xl:text-[175px] text-bone will-change-transform drop-shadow-2xl"
              >
                MOVE
              </h2>
            </div>

            {/* ROW 2: YOUR (Hollow Stroke slicing through layers) */}
            <div className="overflow-visible pl-4 sm:pl-28 md:pl-48 lg:pl-64">
              <h2
                ref={textYourRef}
                className="text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[150px] xl:text-[175px] text-stroke-bold text-bone/70 hover:text-bone transition-colors duration-500 will-change-transform"
              >
                YOUR
              </h2>
            </div>

            {/* ROW 3: WAY. (Accent Electric Lime Signature) */}
            <div className="overflow-visible pl-8 sm:pl-44 md:pl-72 lg:pl-[440px]">
              <h2
                ref={textWayRef}
                className="text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[150px] xl:text-[175px] text-accent-lime will-change-transform drop-shadow-[0_15px_35px_rgba(216,255,0,0.18)]"
              >
                WAY<span className="text-bone">.</span>
              </h2>
            </div>
          </div>

          {/* LAYER 2: Foreground Overlap Plate (Plate 02) */}
          <div
            ref={plate2Ref}
            className="hidden md:block absolute bottom-[8%] left-[6%] lg:left-[10%] w-52 sm:w-68 lg:w-84 aspect-[4/5] bg-obsidian z-30 shadow-2xl overflow-hidden border border-white/20 group cursor-pointer transition-transform duration-500 will-change-transform"
          >
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
              alt="Architectural Stride Silhouette"
              loading="lazy"
              className="w-full h-full object-cover contrast-115 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase text-bone border border-white/10">
              LOOK 02 / FORM TROUSER
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-[10px] font-mono tracking-wider text-bone-soft flex justify-between items-center">
              <span>DOUBLE PLEAT SILHOUETTE</span>
              <span className="text-accent-lime font-bold">VOL. 02</span>
            </div>
          </div>

          {/* LAYER 3: Micro Floating Spec Plate (Plate 03) */}
          <div
            ref={plate3Ref}
            className="hidden xl:block absolute top-[28%] left-[42%] w-44 aspect-[3/4] bg-obsidian/90 backdrop-blur-md z-25 shadow-2xl overflow-hidden border border-accent-lime/30 p-2 will-change-transform"
          >
            <div className="w-full h-full overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop"
                alt="Raw Trench Detail"
                className="w-full h-full object-cover brightness-90"
              />
              <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 text-[8px] font-mono text-accent-lime tracking-widest">
                KINETIC SPEC 03
              </div>
            </div>
          </div>

          {/* Floating Live Telemetry Badge (Desktop) */}
          <div
            ref={cadenceBadgeRef}
            className="hidden lg:flex absolute right-[4%] bottom-[16%] z-30 flex-col gap-2 p-4 bg-obsidian/80 backdrop-blur-md border border-white/10 text-xs font-mono"
          >
            <div className="flex items-center gap-2 text-accent-lime">
              <span className="w-2 h-2 rounded-full bg-accent-lime animate-ping" />
              <span className="font-bold">{t.moveYourWay.activeCadence}</span>
            </div>
            <p className="text-[11px] text-muted max-w-[180px] leading-snug">
              {activeLook === 1 && t.moveYourWay.look1}
              {activeLook === 2 && t.moveYourWay.look2}
              {activeLook === 3 && t.moveYourWay.look3}
            </p>
          </div>
        </div>

        {/* Bottom Control & Call-To-Action Row */}
        <div className="border-t border-white/10 pt-4 sm:pt-6 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 relative z-30">
          {/* Editorial Philosophy Statement */}
          <div className="space-y-1 max-w-xl">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-accent-lime block">
              {t.moveYourWay.commitmentLabel}
            </span>
            <p className="text-xs sm:text-sm text-bone/80 font-light leading-relaxed">
              {t.moveYourWay.commitmentText}
            </p>
          </div>

          {/* Action Links & Progress Timeline */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-6">
            {/* Scrub Progress Gauge */}
            <div className="hidden sm:flex flex-col gap-1 w-32">
              <div className="flex justify-between text-[9px] font-mono text-muted">
                <span>{t.moveYourWay.scrollProg}</span>
                <span ref={percentDisplay2Ref}>0%</span>
              </div>
              <div className="w-full h-[2px] bg-white/10 overflow-hidden">
                <div
                  ref={progressLineRef}
                  className="h-full bg-accent-lime origin-left scale-x-0 will-change-transform"
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <Link
              to="/collections/motion"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-bone hover:bg-accent-lime hover:text-obsidian text-obsidian px-6 sm:px-7 py-3 sm:py-3.5 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 shadow-xl active:scale-98"
            >
              <span>{t.moveYourWay.experienceCta}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
