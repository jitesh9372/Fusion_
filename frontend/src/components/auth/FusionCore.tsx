import React, { useRef, useState } from 'react';
import { motion, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * FusionCore — The central 3D animated visual (Enlarged & Enhanced)
 *
 * Layers:
 * 1. Deep ambient glow halo (380px)
 * 2. Rotating orbital rings (3 concentric, up to 390px, multi-axis)
 * 3. Orbiting luminous nodes
 * 4. High-impact central Core Sphere (112px)
 * 5. Inner light specular highlights
 * 6. Interactive click wave ripple
 */
const FusionCore: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [showRipple, setShowRipple] = useState(false);

  // Mouse parallax
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [10, -10]), { stiffness: 50, damping: 20 });
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-12, 12]), { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left - rect.width / 2) / (rect.width / 2));
    rawY.set((e.clientY - rect.top - rect.height / 2) / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const handleClick = () => {
    if (reducedMotion) return;
    setShowRipple(false);
    requestAnimationFrame(() => {
      setRippleKey(k => k + 1);
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 750);
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: 440, height: 440, perspective: '1100px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="presentation"
    >
      {/* Outer ambient glow halo 1 */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 380,
          height: 380,
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(217,70,239,0.12) 45%, transparent 72%)',
          filter: 'blur(45px)',
          animation: reducedMotion ? 'none' : 'corePulse 3.5s ease-in-out infinite alternate',
        }}
      />

      {/* Secondary colored halo */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 260,
          height: 260,
          background: 'radial-gradient(circle, rgba(129,140,248,0.28) 0%, rgba(99,102,241,0.15) 50%, transparent 80%)',
          filter: 'blur(25px)',
        }}
      />

      {/* 3D rotatable group */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        animate={reducedMotion ? {} : { y: [0, -10, 0] }}
        transition={reducedMotion ? {} : { duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
      >
        {/* Ring 1 — large slow clockwise */}
        <motion.div
          className="absolute rounded-full border border-indigo-400/25"
          style={{
            width: 340,
            height: 340,
            transformStyle: 'preserve-3d',
            rotateX: '68deg',
            boxShadow: '0 0 15px rgba(99,102,241,0.1)',
          }}
          animate={reducedMotion ? {} : { rotateZ: [0, 360] }}
          transition={reducedMotion ? {} : { duration: 24, ease: 'linear', repeat: Infinity }}
        >
          <div
            className="absolute w-3 h-3 rounded-full bg-indigo-300"
            style={{
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 12px rgba(129,140,248,0.9), 0 0 20px rgba(99,102,241,0.6)',
            }}
          />
        </motion.div>

        {/* Ring 2 — mid counter-clockwise with accent glow */}
        <motion.div
          className="absolute rounded-full border border-fuchsia-400/20"
          style={{
            width: 270,
            height: 270,
            transformStyle: 'preserve-3d',
            rotateX: '58deg',
            rotateY: '18deg',
            boxShadow: '0 0 15px rgba(217,70,239,0.1)',
          }}
          animate={reducedMotion ? {} : { rotateZ: [360, 0] }}
          transition={reducedMotion ? {} : { duration: 19, ease: 'linear', repeat: Infinity }}
        >
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-fuchsia-400"
            style={{
              top: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 10px rgba(217,70,239,0.9), 0 0 18px rgba(217,70,239,0.5)',
            }}
          />
        </motion.div>

        {/* Ring 3 — outermost orbit */}
        <motion.div
          className="absolute rounded-full border border-cyan-400/15"
          style={{
            width: 390,
            height: 390,
            transformStyle: 'preserve-3d',
            rotateX: '76deg',
            rotateY: '-14deg',
          }}
          animate={reducedMotion ? {} : { rotateZ: [0, 360] }}
          transition={reducedMotion ? {} : { duration: 32, ease: 'linear', repeat: Infinity }}
        >
          <div
            className="absolute w-2 h-2 rounded-full bg-cyan-300"
            style={{
              top: '-4px',
              left: '32%',
              boxShadow: '0 0 8px rgba(103,232,249,0.9)',
            }}
          />
        </motion.div>

        {/* Core sphere (112px - Enlarged) */}
        <motion.div
          className="relative rounded-full cursor-pointer"
          style={{
            width: 112,
            height: 112,
            background: 'radial-gradient(circle at 35% 32%, #a5b4fc 0%, #818cf8 22%, #6366f1 52%, #4338ca 78%, #1e1b4b 100%)',
            boxShadow: '0 0 45px rgba(99,102,241,0.7), 0 0 90px rgba(99,102,241,0.4), 0 0 140px rgba(99,102,241,0.25)',
            willChange: 'transform',
          }}
          animate={reducedMotion ? {} : {
            scale: [1, 1.05, 1],
            rotateY: [0, 360],
          }}
          transition={reducedMotion ? {} : {
            scale: { duration: 3.2, ease: 'easeInOut', repeat: Infinity },
            rotateY: { duration: 25, ease: 'linear', repeat: Infinity },
          }}
          whileHover={reducedMotion ? {} : {
            scale: 1.12,
            boxShadow: '0 0 60px rgba(99,102,241,0.85), 0 0 110px rgba(99,102,241,0.55), 0 0 160px rgba(217,70,239,0.3)',
          }}
          whileTap={reducedMotion ? {} : { scale: 1.15 }}
        >
          {/* Top-left high specular highlight */}
          <div
            className="absolute rounded-full"
            style={{
              width: '38%',
              height: '38%',
              top: '14%',
              left: '16%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.15) 50%, transparent 80%)',
            }}
          />

          {/* Bottom-right iridescent fuchsia glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 75% 75%, rgba(217,70,239,0.35) 0%, transparent 65%)',
            }}
          />
        </motion.div>

        {/* Expanding click ripple */}
        {showRipple && (
          <motion.div
            key={rippleKey}
            className="absolute rounded-full border border-indigo-400/70 pointer-events-none"
            style={{ width: 112, height: 112 }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          />
        )}
      </motion.div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes corePulse {
          0%   { transform: scale(1); opacity: 0.85; }
          100% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FusionCore;
