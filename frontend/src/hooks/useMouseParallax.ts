import { useEffect, useRef, useCallback } from 'react';
import { useMotionValue, useSpring, MotionValue } from 'framer-motion';
import { SPRING_PARALLAX } from '@/animations/motionConfig';

interface UseMouseParallaxReturn {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * useMouseParallax
 *
 * Tracks mouse position relative to a container element.
 * Returns raw and spring-smoothed motion values in the range -1 to 1.
 * Resets smoothly to 0,0 on mouse leave.
 *
 * Usage:
 *   const { containerRef, smoothX, smoothY } = useMouseParallax();
 *   // Apply smoothX/smoothY to motion elements via useTransform
 */
export const useMouseParallax = (enabled = true): UseMouseParallaxReturn => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, SPRING_PARALLAX as Parameters<typeof useSpring>[1]);
  const smoothY = useSpring(mouseY, SPRING_PARALLAX as Parameters<typeof useSpring>[1]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalize to -1 to 1
      mouseX.set((e.clientX - cx) / (rect.width / 2));
      mouseY.set((e.clientY - cy) / (rect.height / 2));
    },
    [enabled, mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, handleMouseMove, handleMouseLeave]);

  // Disable when not enabled — reset to center
  useEffect(() => {
    if (!enabled) {
      mouseX.set(0);
      mouseY.set(0);
    }
  }, [enabled, mouseX, mouseY]);

  return { mouseX, mouseY, smoothX, smoothY, containerRef };
};
