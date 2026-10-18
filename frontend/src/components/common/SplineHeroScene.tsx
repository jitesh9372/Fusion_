import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react';

interface SplineHeroSceneProps {
  className?: string;
  mode?: 'panel' | 'bg';
}

/**
 * Clean, lightweight futuristic platform visual component.
 * Replaces heavy external 3D WebGL runtime with pure CSS/SVG animations.
 */
export const SplineHeroScene: React.FC<SplineHeroSceneProps> = ({
  className = '',
  mode = 'panel',
}) => {
  const isBg = mode === 'bg';

  const wrapperClass = isBg
    ? `absolute inset-0 w-full h-full ${className}`
    : `relative w-full h-full rounded-3xl overflow-hidden ${className}`;

  return (
    <div className={wrapperClass} style={isBg ? { zIndex: 0 } : undefined}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-2xl" />
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 border border-cyan-500/30 flex items-center justify-center shadow-xl shadow-cyan-500/10"
        >
          <Zap className="w-10 h-10 text-cyan-400" />
        </motion.div>
        <div>
          <h4 className="text-base font-bold text-white">FUSION Cooperative Engine</h4>
          <p className="text-xs text-white/50 max-w-xs mt-1">
            Real-time decentralized dispatch, 100% escrow security, and verified trades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplineHeroScene;
