/**
 * FUSION Shared Motion Design System
 * Unified animation constants, easing curves, transitions, and variants
 * across Customer, Worker, and Admin interfaces.
 */
import type { Transition, Variants } from 'framer-motion';

// ─── Easing Curves ────────────────────────────────────────────────────────────
export const EASE_STANDARD    = [0.4, 0, 0.2, 1]   as const; // Smooth standard (Material/Apple hybrid)
export const EASE_DECELERATE  = [0.0, 0, 0.2, 1]   as const; // Smooth entrance
export const EASE_ACCELERATE  = [0.4, 0, 1.0, 1]   as const; // Smooth exit
export const EASE_TACTILE     = [0.25, 0.1, 0.25, 1] as const; // Tactile response

// ─── Durations ────────────────────────────────────────────────────────────────
export const DURATION_INSTANT = 0.10;
export const DURATION_FAST    = 0.18;
export const DURATION_BASE    = 0.24;
export const DURATION_SLOW    = 0.36;
export const DURATION_SLOWER  = 0.50;

// ─── Spring Presets ───────────────────────────────────────────────────────────
export const SPRING_TACTILE: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
  mass: 0.8,
};

export const SPRING_SOFT: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
  mass: 1,
};

export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
};

export const SPRING_PARALLAX: Transition = {
  type: 'spring',
  stiffness: 50,
  damping: 20,
};

export const SPRING_GENTLE: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 18,
};

// ─── Transitions ──────────────────────────────────────────────────────────────
export const transitionFast: Transition = {
  duration: DURATION_FAST,
  ease: EASE_STANDARD,
};

export const transitionBase: Transition = {
  duration: DURATION_BASE,
  ease: EASE_STANDARD,
};

export const transitionSlow: Transition = {
  duration: DURATION_SLOW,
  ease: EASE_DECELERATE,
};

export const transitionDecelerate: Transition = {
  duration: DURATION_SLOW,
  ease: EASE_DECELERATE,
};

// ─── Auth Card Variants ───────────────────────────────────────────────────────
export const authCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION_SLOW,
      ease: EASE_DECELERATE,
    },
  },
};

// ─── Page Transition Variants ─────────────────────────────────────────────────
export const pageEnterVariants: Variants = {
  hidden:  { opacity: 0, x: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.22, ease: EASE_DECELERATE },
  },
  exit: {
    opacity: 0,
    x: -16,
    scale: 0.98,
    transition: { duration: 0.18, ease: EASE_ACCELERATE },
  },
};

// ─── Logo Entrance Variants ───────────────────────────────────────────────────
export const logoSymbolVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_DECELERATE },
  },
};

export const logoWordmarkVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.1,
    },
  },
};

export const logoLetterVariants: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_DECELERATE },
  },
};

export const logoTaglineVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.3, ease: EASE_DECELERATE },
  },
};

// ─── Floating Card Variants ───────────────────────────────────────────────────
export const floatingCardEnterVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_SLOW,
      delay: 0.4 + i * 0.15,
      ease: EASE_DECELERATE,
    },
  }),
};


// ─── Button Tactile Motion Props ──────────────────────────────────────────────
export const buttonMotion = {
  whileHover: {
    scale: 1.02,
    transition: { duration: DURATION_FAST, ease: EASE_TACTILE },
  },
  whileTap: {
    scale: 0.97,
    transition: { duration: DURATION_INSTANT, ease: EASE_TACTILE },
  },
};

export const buttonMotionSubtle = {
  whileHover: {
    scale: 1.015,
    transition: { duration: DURATION_FAST, ease: EASE_TACTILE },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: DURATION_INSTANT, ease: EASE_TACTILE },
  },
};

// ─── Interactive Card Motion Props ────────────────────────────────────────────
export const cardInteractiveMotion = {
  whileHover: {
    y: -3,
    scale: 1.01,
    transition: { duration: DURATION_FAST, ease: EASE_DECELERATE },
  },
  whileTap: {
    scale: 0.99,
    transition: { duration: DURATION_INSTANT, ease: EASE_TACTILE },
  },
};

// ─── Staggered Container & Child Variants ─────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemFadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.99,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION_BASE,
      ease: EASE_DECELERATE,
    },
  },
};

export const staggerItemFadeScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION_BASE,
      ease: EASE_DECELERATE,
    },
  },
};

// ─── Modal & Dialog Variants ──────────────────────────────────────────────────
export const modalBackdropVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: { duration: DURATION_BASE, ease: EASE_DECELERATE },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: DURATION_FAST, ease: EASE_ACCELERATE },
  },
};

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATION_BASE,
      ease: EASE_DECELERATE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: {
      duration: DURATION_FAST,
      ease: EASE_ACCELERATE,
    },
  },
};

// ─── Drawer Variants ──────────────────────────────────────────────────────────
export const drawerSlideLeftVariants: Variants = {
  hidden: { x: '-100%', opacity: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: DURATION_SLOW, ease: EASE_DECELERATE },
  },
  exit: {
    x: '-100%',
    opacity: 0.8,
    transition: { duration: DURATION_FAST, ease: EASE_ACCELERATE },
  },
};

export const drawerSlideRightVariants: Variants = {
  hidden: { x: '100%', opacity: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: DURATION_SLOW, ease: EASE_DECELERATE },
  },
  exit: {
    x: '100%',
    opacity: 0.8,
    transition: { duration: DURATION_FAST, ease: EASE_ACCELERATE },
  },
};

// ─── Toast Variants ───────────────────────────────────────────────────────────
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION_BASE, ease: EASE_DECELERATE },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: DURATION_FAST, ease: EASE_ACCELERATE },
  },
};

// ─── Shimmer Pulse for Skeletons ──────────────────────────────────────────────
export const skeletonShimmerVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.85, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Error Shake Keyframes ────────────────────────────────────────────────────
export const shakeKeyframes = {
  x: [0, -6, 6, -4, 4, 0],
  transition: { duration: 0.35, ease: 'easeOut' },
};

export const errorMessageVariants: Variants = {
  hidden:  { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: EASE_DECELERATE },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.12 },
  },
};

// ─── Reduced Motion Support ───────────────────────────────────────────────────
export const reducedMotionVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION_BASE } },
  exit:    { opacity: 0, transition: { duration: DURATION_FAST } },
};
