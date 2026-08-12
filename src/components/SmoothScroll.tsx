import React, { useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  useEffect(() => {
    try {
      const LenisCtor = typeof Lenis === 'function' ? Lenis : (Lenis as any)?.default;
      if (typeof LenisCtor !== 'function') return;

      const lenis = new LenisCtor({
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (lenis && typeof lenis.destroy === 'function') {
          lenis.destroy();
        }
      };
    } catch (err) {
      console.warn('Lenis smooth scroll fallback:', err);
    }
  }, []);

  return <>{children}</>;
};
