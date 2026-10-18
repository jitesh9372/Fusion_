import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { resendVerificationEmail } from '@/services/authService';
import { authConfig } from '@/config/authConfig';
import AuthToast, { useToast } from './AuthToast';
import { SPRING_SOFT, DURATION_BASE, EASE_STANDARD } from '@/animations/motionConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EmailVerificationNotice: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const { toasts, addToast, dismissToast } = useToast();

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0 || resending) return;
    setResending(true);
    const result = await resendVerificationEmail(email);
    setResending(false);

    if (!result.success) {
      addToast('error', result.error ?? 'Failed to resend email.');
      return;
    }

    addToast('success', 'Verification email sent! Check your inbox.');
    setCooldown(authConfig.resendCooldownSeconds);
  }, [email, cooldown, resending, addToast]);

  return (
    <>
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <div className="px-8 py-8 space-y-6 text-center">
        {/* Animated envelope */}
        <motion.div
          className="flex items-center justify-center mx-auto"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center"
            animate={
              reducedMotion
                ? {}
                : { y: [0, -5, 0], boxShadow: ['0 0 0px rgba(99,102,241,0.2)', '0 0 20px rgba(99,102,241,0.35)', '0 0 0px rgba(99,102,241,0.2)'] }
            }
            transition={reducedMotion ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Mail className="w-9 h-9 text-indigo-400" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_SOFT}
        >
          <h1 className="text-2xl font-bold text-white">Check your inbox</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            We've sent a verification link to{' '}
            {email ? (
              <span className="text-indigo-400 font-medium">{email}</span>
            ) : (
              'your email address'
            )}
            .
          </p>
        </motion.div>

        {/* Resend button */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: DURATION_BASE, ease: EASE_STANDARD }}
        >
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending || !email}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              text-sm font-medium border transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500/40
              ${cooldown > 0
                ? 'border-white/10 text-white/30 cursor-not-allowed bg-white/[0.02]'
                : 'border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400 cursor-pointer bg-transparent'
              }
            `}
            aria-label={cooldown > 0 ? `Resend in ${cooldown} seconds` : 'Resend verification email'}
          >
            <motion.span
              animate={resending && !reducedMotion ? { rotate: 360 } : {}}
              transition={resending ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.span>
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend Email'}
          </button>

          <Link
            to="/auth/signin"
            className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors focus:outline-none focus:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </motion.div>
      </div>
    </>
  );
};

export default EmailVerificationNotice;
