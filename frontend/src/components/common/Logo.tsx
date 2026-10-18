import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/config/siteConfig';
import {
  logoSymbolVariants,
  logoWordmarkVariants,
  logoLetterVariants,
  logoTaglineVariants,
} from '@/animations/motionConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  animated?: boolean;
  showTagline?: boolean;
  className?: string;
}

// ─── Size Maps ────────────────────────────────────────────────────────────────
const sizeMap = {
  sm: { symbol: 28, wordmark: 'text-xl', tagline: 'text-xs', gap: 'gap-2' },
  md: { symbol: 36, wordmark: 'text-2xl', tagline: 'text-sm', gap: 'gap-2.5' },
  lg: { symbol: 48, wordmark: 'text-4xl', tagline: 'text-base', gap: 'gap-3' },
};

// ─── Node Symbol (three converging nodes) ────────────────────────────────────
const FusionSymbol: React.FC<{ size: number; animated: boolean }> = ({ size, animated }) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      variants={logoSymbolVariants}
      initial="hidden"
      animate="visible"
      whileHover={animated && !reducedMotion ? { scale: 1.08 } : undefined}
      transition={animated && !reducedMotion ? { duration: 0.3 } : undefined}
    >
      {/* Outer glow filter */}
      <defs>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="logo-grad-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="logo-grad-2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      <line x1="24" y1="24" x2="8" y2="10"  stroke="url(#logo-grad-1)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="24" y1="24" x2="40" y2="10" stroke="url(#logo-grad-1)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="24" y1="24" x2="24" y2="42" stroke="url(#logo-grad-2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

      {/* Satellite nodes */}
      <circle cx="8"  cy="10" r="3.5" fill="#818cf8" opacity="0.85" />
      <circle cx="40" cy="10" r="3.5" fill="#818cf8" opacity="0.85" />
      <circle cx="24" cy="42" r="3.5" fill="#d946ef" opacity="0.85" />

      {/* Central core */}
      <motion.circle
        cx="24"
        cy="24"
        r="7"
        fill="url(#logo-grad-2)"
        filter="url(#logo-glow)"
        animate={animated && !reducedMotion ? { scale: [1, 1.04, 1] } : undefined}
        transition={animated && !reducedMotion ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />
      {/* Inner highlight */}
      <circle cx="21.5" cy="21.5" r="2" fill="white" opacity="0.25" />
    </motion.svg>
  );
};

// ─── Logo Component ───────────────────────────────────────────────────────────
const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  animated = true,
  showTagline = false,
  className = '',
}) => {
  const reducedMotion = useReducedMotion();
  const { symbol, wordmark, tagline, gap } = sizeMap[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-[#1B2420]';
  const muted = variant === 'light' ? 'text-white/50' : 'text-[#3A423E]';
  const letters = siteConfig.name.split('');

  return (
    <div className={`flex flex-col items-start ${gap} ${className}`}>
      {/* Symbol + Wordmark row */}
      <div className={`flex items-center ${gap}`}>
        <FusionSymbol size={symbol} animated={animated} />

        {/* Wordmark */}
        <motion.div
          className={`flex items-end`}
          variants={logoWordmarkVariants}
          initial="hidden"
          animate="visible"
        >
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              className={`${wordmark} font-black tracking-tight ${textColor} leading-none`}
              variants={reducedMotion ? undefined : logoLetterVariants}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Tagline */}
      {showTagline && (
        <motion.p
          className={`${tagline} ${muted} font-medium leading-snug`}
          variants={logoTaglineVariants}
          initial="hidden"
          animate="visible"
        >
          {siteConfig.tagline}
        </motion.p>
      )}
    </div>
  );
};

export default Logo;
