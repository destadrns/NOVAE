import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LenisProviderProps {
  children: React.ReactNode;
}

export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafCallbackRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Ultra-optimized Lenis instance for 60Hz-240Hz screens
    const lenis = new Lenis({
      lerp: 0.09, // Silky smooth linear interpolation without lag spikes
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.0,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;
    if (typeof window !== 'undefined') {
      (window as any).__lenis = lenis;
    }

    // Connect Lenis to ScrollTrigger without double-ticking
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    rafCallbackRef.current = updateLenis;

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0); // Zero lagSmoothing prevents jitter when scrubbing

    return () => {
      if (typeof window !== 'undefined') {
        (window as any).__lenis = null;
      }
      if (rafCallbackRef.current) {
        gsap.ticker.remove(rafCallbackRef.current);
      }
      ScrollTrigger.getAll().forEach((st) => st.kill());
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
