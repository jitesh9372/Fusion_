import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import Logo from '@/components/common/Logo';
import FusionCore from '@/components/auth/FusionCore';
import FloatingCard from '@/components/auth/FloatingCard';
import ParticleBackground from '@/components/auth/ParticleBackground';
import { siteConfig } from '@/config/siteConfig';

// ─── Card Data (Customer, Worker, Admin) ──────────────────────────────────────
const CARDS = [
  {
    label: 'customer' as const,
    tagline: 'Find trusted services',
    translateZ: 90,
    restingRotation: -3.5,
    floatDuration: 5.5,
    floatDelay: 0,
  },
  {
    label: 'worker' as const,
    tagline: 'Grow your opportunities',
    translateZ: 65,
    restingRotation: 0,
    floatDuration: 6.2,
    floatDelay: 0.6,
  },
  {
    label: 'admin' as const,
    tagline: 'Platform governance',
    translateZ: 45,
    restingRotation: 3.5,
    floatDuration: 7,
    floatDelay: 1.1,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface AuthBrandingProps {
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
}

const AuthBranding: React.FC<AuthBrandingProps> = ({ smoothX, smoothY }) => {
  return (
    <div className="relative flex flex-col h-full px-8 xl:px-12 py-8 overflow-hidden">
      <ParticleBackground />

      {/* Logo */}
      <div className="relative z-10">
        <Logo size="lg" variant="light" animated showTagline />
      </div>

      {/* 3D Visual — Core + Floating Cards */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10 py-4">
        {/* Fusion Core (Bigger) */}
        <FusionCore />

        {/* Floating cards (Customer, Worker, Admin) */}
        <div
          className="flex flex-row flex-wrap items-center justify-center gap-4 max-w-lg"
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
          {CARDS.map((card, i) => (
            <FloatingCard
              key={card.label}
              index={i}
              smoothX={smoothX}
              smoothY={smoothY}
              {...card}
            />
          ))}
        </div>
      </div>

      {/* Footer tagline */}
      <motion.p
        className="relative z-10 text-xs text-white/30 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        {siteConfig.copyright}
      </motion.p>
    </div>
  );
};

export default AuthBranding;
