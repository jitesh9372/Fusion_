import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { User, Briefcase, Shield, Check, ArrowRight } from 'lucide-react';
import type { RoleConfigItem } from '@/types/user';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface RoleCardProps {
  config: RoleConfigItem;
  index: number;
  isSelected: boolean;
  isOtherSelected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const roleIcons = {
  customer: User,
  worker: Briefcase,
  admin: Shield,
};

export const RoleCard: React.FC<RoleCardProps> = ({
  config,
  index,
  isSelected,
  isOtherSelected,
  disabled,
  onSelect,
}) => {
  const reducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt on hover
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const IconComponent = roleIcons[config.id] || User;

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{
        opacity: isOtherSelected ? 0.35 : 1,
        y: 0,
        scale: isSelected ? 1.03 : 1,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.1,
        ease: [0, 0, 0.2, 1],
      }}
      style={{
        perspective: '1000px',
      }}
      className="w-full flex-1"
    >
      <motion.div
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          background: isSelected
            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)'
            : 'rgba(255, 255, 255, 0.04)',
          boxShadow: isSelected
            ? `0 0 40px ${config.accentColor.glow}, 0 20px 60px rgba(0, 0, 0, 0.6)`
            : '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={disabled ? undefined : onSelect}
        className={`
          relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-3xl cursor-pointer select-none
          backdrop-blur-2xl transition-all duration-300 group
          ${isSelected
            ? `border-2 border-white/50 shadow-2xl`
            : `border border-white/10 hover:border-white/25 hover:shadow-xl`
          }
        `}
        whileHover={
          !reducedMotion && !disabled
            ? {
                y: -6,
                boxShadow: `0 0 35px ${config.accentColor.glow}, 0 20px 50px rgba(0, 0, 0, 0.5)`,
              }
            : {}
        }
      >
        {/* Top ambient glow bar */}
        <div
          className={`
            absolute top-0 left-8 right-8 h-1 rounded-full
            bg-gradient-to-r ${config.accentColor.gradient}
            ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}
            transition-opacity duration-300
          `}
          aria-hidden="true"
        />

        {/* Selected Checkmark Badge */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg z-20"
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </motion.div>
        )}

        {/* Top Header Section */}
        <div className="space-y-4">
          {/* Floating Icon */}
          <motion.div
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              bg-gradient-to-br ${config.accentColor.gradient} text-white shadow-lg
              border border-white/20
            `}
            animate={
              reducedMotion
                ? {}
                : config.id === 'customer'
                ? { y: [0, -4, 0] }
                : config.id === 'worker'
                ? { rotate: [-1, 2, -1], y: [0, -3, 0] }
                : { scale: [1, 1.03, 1] }
            }
            transition={
              reducedMotion
                ? {}
                : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <IconComponent className="w-7 h-7 stroke-[2]" />
          </motion.div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{config.label}</h3>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${config.accentColor.badge}`}>
                {config.tagline}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/55 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="my-6 space-y-2.5 pt-4 border-t border-white/5">
          {config.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-white/70">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-gradient-to-r ${config.accentColor.gradient}`} />
              <span className="leading-snug">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            className={`
              w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl
              text-xs sm:text-sm font-bold tracking-wide transition-all duration-200
              ${isSelected
                ? `bg-white text-gray-950 shadow-lg shadow-white/10`
                : `bg-white/[0.06] text-white/80 hover:text-white hover:bg-white/[0.12] border border-white/10`
              }
            `}
          >
            <span>{config.cta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoleCard;
