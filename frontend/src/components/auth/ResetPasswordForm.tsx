import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PasswordInput from './PasswordInput';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import PrimaryButton from './PrimaryButton';
import AuthToast, { useToast } from './AuthToast';
import { authCardVariants, SPRING_SOFT } from '@/animations/motionConfig';

// ─── Validation Schema ────────────────────────────────────────────────────────
const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/\d/, 'Password must contain at least one number.'),
    confirm_password: z.string().min(1, 'Please confirm your password.'),
  })
  .refine(data => data.password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

type FormData = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────
const ResetPasswordForm: React.FC = () => {
  const { updatePassword } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();
  const [loading, setLoading]      = useState(false);
  const [success, setSuccess]      = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

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
    const result = await updatePassword(data);
    setLoading(false);

    if (!result.success) {
      addToast('error', result.error ?? 'Failed to update password.');
      return;
    }

    setSuccess(true);
  };

  return (
    <>
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <div className="px-8 py-8">
        <AnimatePresence mode="wait">
          {!success ? (
            /* ── Form ── */
            <motion.div
              key="form"
              variants={authCardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Set new password</h1>
                <p className="text-sm text-white/50">Choose a strong password for your account.</p>
              </div>

              <form method="POST" action="#" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="on" className="space-y-4">
                <div>
                  <PasswordInput
                    label="New Password"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    registration={{
                      ...register('password'),
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        setPasswordValue(e.target.value);
                        register('password').onChange(e);
                      },
                    }}
                  />
                  <PasswordStrengthMeter password={passwordValue} />
                </div>

                <PasswordInput
                  label="Confirm Password"
                  autoComplete="new-password"
                  error={errors.confirm_password?.message}
                  registration={register('confirm_password')}
                />

                <PrimaryButton loading={loading} disabled={loading} showArrow={false}>
                  Update Password
                </PrimaryButton>
              </form>
            </motion.div>
          ) : (
            /* ── Success ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_SOFT}
              className="space-y-6 text-center py-4"
            >
              <motion.div
                className="flex items-center justify-center mx-auto"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Password updated!</h2>
                <p className="text-sm text-white/50">
                  Your password has been updated successfully.
                </p>
              </div>

              <Link
                to="/auth/signin"
                className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              >
                Return to Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ResetPasswordForm;
