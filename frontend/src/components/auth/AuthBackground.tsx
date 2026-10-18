import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ─── Background ───────────────────────────────────────────────────────────────
/**
 * Full-screen premium dark background with:
 * - Deep dark base
 * - Soft radial gradients (asymmetric)
 * - Animated glowing orbs (slow drift)
 * - Subtle noise texture via SVG
 */
const AuthBackground: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const orbRef1 = useRef<HTMLDivElement>(null);
  const orbRef2 = useRef<HTMLDivElement>(null);
  const orbRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    // Pause orb animations on tab hidden
    const handleVisibility = () => {
      const paused = document.hidden ? 'paused' : 'running';
      [orbRef1, orbRef2, orbRef3].forEach(ref => {
        if (ref.current) {
          ref.current.style.animationPlayState = paused;
        }
      });
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />

      {/* Radial gradients — asymmetric, low opacity */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(217,70,239,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)
          `,
        }}
      />

      {/* Animated orbs */}
      {!reducedMotion && (
        <>
          <div
            ref={orbRef1}
            className="absolute rounded-full"
            style={{
              width: '500px',
              height: '500px',
              top: '-10%',
              left: '-5%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'orbDrift1 32s ease-in-out infinite alternate',
              willChange: 'transform',
            }}
          />
          <div
            ref={orbRef2}
            className="absolute rounded-full"
            style={{
              width: '600px',
              height: '600px',
              bottom: '-15%',
              right: '-10%',
              background: 'radial-gradient(circle, rgba(217,70,239,0.08) 0%, transparent 70%)',
              filter: 'blur(100px)',
              animation: 'orbDrift2 28s ease-in-out infinite alternate',
              willChange: 'transform',
            }}
          />
          <div
            ref={orbRef3}
            className="absolute rounded-full"
            style={{
              width: '400px',
              height: '400px',
              top: '40%',
              left: '35%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
              filter: 'blur(120px)',
              animation: 'orbDrift3 35s ease-in-out infinite alternate',
              willChange: 'transform',
            }}
          />
        </>
      )}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes orbDrift1 {
          0%   { transform: translate(0px, 0px); }
          100% { transform: translate(40px, 30px); }
        }
        @keyframes orbDrift2 {
          0%   { transform: translate(0px, 0px); }
          100% { transform: translate(-35px, -40px); }
        }
        @keyframes orbDrift3 {
          0%   { transform: translate(0px, 0px); }
          100% { transform: translate(20px, -25px); }
        }
      `}</style>
    </div>
  );
};

export default AuthBackground;
