import React from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import AuthBackground from '@/components/auth/AuthBackground';

interface AuthLoadingScreenProps {
  message?: string;
  submessage?: string;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message = 'Preparing your experience...',
  submessage = 'Connecting you to FUSION',
}) => {
  return (
    <div className="fixed inset-0 min-h-screen w-full flex flex-col items-center justify-center px-4 overflow-hidden z-50 bg-[#0a0a0f]">
      <AuthBackground />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Pulsing Logo */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Logo size="lg" variant="light" animated={true} showTagline={false} />
        </motion.div>

        {/* Minimal Custom Progress Bar / Spinner */}
        <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden relative">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white tracking-wide">{message}</h3>
          <p className="text-xs text-white/40">{submessage}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLoadingScreen;
