import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FloatingInput from './FloatingInput';
import PrimaryButton from './PrimaryButton';
import AuthToast, { useToast } from './AuthToast';
import { authCardVariants, SPRING_SOFT } from '@/animations/motionConfig';

// ─── Validation Schema ────────────────────────────────────────────────────────
const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

type FormData = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────
const ForgotPasswordForm: React.FC = () => {
  const { resetPassword } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await resetPassword(data);
    setLoading(false);

    if (!result.success) {
      addToast('error', result.error ?? 'Failed to send reset email.');
      return;
    }

    setSentEmail(data.email);
    setSent(true);
  };

  return (
    <>
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <div className="px-8 py-8">
        <AnimatePresence mode="wait">
          {!sent ? (
            /* ── Form state ── */
            <motion.div
              key="form"
              variants={authCardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
                <p className="text-sm text-white/50">
                  Enter your email and we'll send you a password reset link.
                </p>
              </div>

              <form method="POST" action="#" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="on" className="space-y-4">
                <FloatingInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  registration={register('email')}
                />

                <PrimaryButton loading={loading} disabled={loading} showArrow={false}>
                  Send Reset Link
                </PrimaryButton>
              </form>

              <div className="text-center">
                <Link
                  to="/auth/signin"
                  className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors focus:outline-none focus:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            /* ── Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_SOFT}
              className="space-y-6 text-center py-4"
            >
              {/* Mail icon */}
              <motion.div
                className="flex items-center justify-center mx-auto"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="w-16 h-16 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-indigo-400" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Check your inbox</h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  Password reset instructions have been sent to{' '}
                  <span className="text-indigo-400 font-medium">{sentEmail}</span>.
                </p>
              </div>

              <Link
                to="/auth/signin"
                className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors focus:outline-none focus:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
