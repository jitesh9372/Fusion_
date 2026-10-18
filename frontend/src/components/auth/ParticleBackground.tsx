import React, { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  layer: 'back' | 'front';
}

const ParticleBackground: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = isMobile ? 10 : 25;

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 8 + Math.random() * 7,
      delay: -(Math.random() * 15),
      layer: Math.random() > 0.5 ? 'front' : 'back',
    }));
  }, [count]);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;
    const handleVisibility = () => {
      if (!containerRef.current) return;
      const state = document.hidden ? 'paused' : 'running';
      containerRef.current.style.animationPlayState = state;
      containerRef.current.querySelectorAll('.fusion-particle').forEach(el => {
        (el as HTMLElement).style.animationPlayState = state;
      });
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes particleDrift {
          0%   { transform: translateY(0px); opacity: 0; }
          10%  { opacity: 0.4; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
      `}</style>

      {particles.map(p => (
        <div
          key={p.id}
          className="fusion-particle absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.layer === 'front'
              ? 'rgba(129, 140, 248, 0.6)'
              : 'rgba(217, 70, 239, 0.3)',
            filter: p.layer === 'back' ? 'blur(1px)' : 'none',
            animation: `particleDrift ${p.duration}s ${p.delay}s ease-in-out infinite`,
            willChange: 'transform, opacity',
            zIndex: p.layer === 'front' ? 2 : 0,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
