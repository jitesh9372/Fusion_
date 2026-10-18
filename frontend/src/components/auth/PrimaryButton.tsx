import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { DURATION_FAST, DURATION_BASE, EASE_STANDARD } from '@/animations/motionConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PrimaryButtonProps {
  type?: 'submit' | 'button' | 'reset';
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  className?: string;
}

const Spinner: React.FC = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  type = 'submit',
  loading,
  success,
  disabled,
  children,
  onClick,
  showArrow = true,
  className = '',
}) => {
  const reducedMotion = useReducedMotion();
  const isDisabled = disabled || loading || success;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`
        relative w-full flex items-center justify-center gap-2
        px-4 py-3 rounded-xl min-h-[46px]
        text-sm font-semibold text-white
        focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-0
        disabled:cursor-not-allowed disabled:opacity-70
        select-none overflow-hidden
        transition-colors duration-200
        ${success ? 'bg-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-indigo-500'}
        ${className}
      `}
      whileHover={
        !reducedMotion && !isDisabled
          ? { scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.4), 0 4px 12px rgba(0,0,0,0.3)' }
          : {}
      }
      whileTap={!reducedMotion && !isDisabled ? { scale: 0.97 } : {}}
      transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
    >
      {/* Hover shimmer */}
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: DURATION_FAST }}
        aria-hidden="true"
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            className="flex items-center gap-2 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_FAST }}
          >
            <Spinner />
            <span>Authenticating…</span>
          </motion.span>
        ) : success ? (
          <motion.span
            key="success"
            className="flex items-center gap-2 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_BASE }}
          >
            <Check className="w-4 h-4" />
            <span>Success!</span>
          </motion.span>
        ) : (
          <motion.span
            key="default"
            className="flex items-center gap-2 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_FAST }}
          >
            <span>{children}</span>
            {showArrow && (
              <motion.span
                whileHover={!reducedMotion ? { x: 3 } : {}}
                transition={{ duration: DURATION_FAST, ease: EASE_STANDARD }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default PrimaryButton;
