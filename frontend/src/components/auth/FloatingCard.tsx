import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { floatingCardEnterVariants, EASE_STANDARD } from '@/animations/motionConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons = {
  customer: '👤',
  worker:   '⚡',
  admin:    '🛡️',
};

const badgeStyles = {
  customer: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  worker:   'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
  admin:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface FloatingCardProps {
  index: number;
  label: 'customer' | 'worker' | 'admin';
  tagline: string;
  translateZ: number;
  restingRotation: number;
  floatDuration: number;
  floatDelay: number;
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
}

const parallaxMultipliers = [1.4, 1.0, 0.75];

const FloatingCard: React.FC<FloatingCardProps> = ({
  index,
  label,
  tagline,
  translateZ,
  restingRotation,
  floatDuration,
  floatDelay,
  smoothX,
  smoothY,
}) => {
  const reducedMotion = useReducedMotion();
  const multiplier = parallaxMultipliers[index] ?? 1;

  const cardX = useTransform(smoothX, v => reducedMotion ? 0 : v * 16 * multiplier);
  const cardY = useTransform(smoothY, v => reducedMotion ? 0 : v * 12 * multiplier);

  const labelDisplay = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <motion.div
      custom={index}
      variants={floatingCardEnterVariants}
      initial="hidden"
      animate="visible"
      style={{
        translateZ,
        rotate: restingRotation,
        x: cardX,
        y: cardY,
        willChange: 'transform',
      }}
    >
      <motion.div
        className="relative px-5 py-3.5 rounded-2xl cursor-default select-none group"
        style={{
          background: 'rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.1)',
          minWidth: '160px',
        }}
        animate={reducedMotion ? {} : {
          y: [0, -8, 0],
          rotateZ: [restingRotation, restingRotation + 1.5, restingRotation],
        }}
        transition={reducedMotion ? {} : {
          duration: floatDuration,
          delay: floatDelay,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          transition: { duration: 0.2, ease: EASE_STANDARD },
        }}
      >
        {/* Glow accent */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
            <span>{icons[label]}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-white leading-tight tracking-wide">{labelDisplay}</p>
            </div>
            <p className="text-[11px] text-white/55 leading-tight mt-0.5 font-medium">{tagline}</p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-5 right-5 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(217,70,239,0.3), transparent)' }}
        />
      </motion.div>
    </motion.div>
  );
};

export default FloatingCard;
