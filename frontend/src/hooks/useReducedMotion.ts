import { useEffect, useState } from 'react';

/**
 * useReducedMotion
 *
 * Returns true if the user has set their device to prefer reduced motion.
 * Use this to conditionally disable or simplify animations.
 *
 * Usage:
 *   const reducedMotion = useReducedMotion();
 *   const variants = reducedMotion ? reducedMotionVariants : pageEnterVariants;
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
