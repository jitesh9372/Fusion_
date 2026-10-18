import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, className = '' }) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      layout={!reducedMotion}
      className={`relative w-full rounded-3xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0, 0, 0.2, 1],
        layout: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.075) 0%, rgba(255, 255, 255, 0.035) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: `
          0 0 50px rgba(99, 102, 241, 0.16),
          0 0 100px rgba(217, 70, 239, 0.08),
          0 25px 80px rgba(0, 0, 0, 0.65),
          inset 0 1px 0 rgba(255, 255, 255, 0.18)
        `,
      }}
    >
      {/* Top glowing beam (multi-layer for intense soft bloom) */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(129, 140, 248, 0.8) 20%, rgba(217, 70, 239, 0.9) 50%, rgba(99, 102, 241, 0.8) 80%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Top beam glow flare */}
      <div
        className="absolute top-[-4px] left-[15%] right-[15%] h-[10px] z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.7), rgba(217, 70, 239, 0.7), transparent)',
          filter: 'blur(8px)',
        }}
        aria-hidden="true"
      />

      {/* Inner ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.08) 0%, rgba(217, 70, 239, 0.03) 40%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default AuthCard;
