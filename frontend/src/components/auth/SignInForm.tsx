import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authConfig } from '@/config/authConfig';
import getRoleRedirect from '@/utils/roleRedirect';
import FloatingInput from './FloatingInput';
import PasswordInput from './PasswordInput';
import PrimaryButton from './PrimaryButton';
import GoogleButton from './GoogleButton';
import AuthDivider from './AuthDivider';
import AuthToast, { useToast } from './AuthToast';
import RoleSelector from './RoleSelector';
import type { UserRole } from '@/types/auth';

// ─── Validation Schema ────────────────────────────────────────────────────────
const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormData = z.infer<typeof schema>;

const roleConfig: Record<
  UserRole,
  { title: string; subtitle: string; badge?: string; allowSignUp: boolean; allowGoogle: boolean }
> = {
  customer: {
    title: 'Customer Sign In',
    subtitle: 'Sign in to access trusted community services.',
    allowSignUp: true,
    allowGoogle: true,
  },
  worker: {
    title: 'Worker Sign In',
    subtitle: 'Sign in to manage your services, jobs, and earnings.',
    allowSignUp: true,
    allowGoogle: true,
  },
  admin: {
    title: 'Admin Portal',
    subtitle: 'Sign in with your assigned administrator credentials.',
    badge: 'Restricted Access',
    allowSignUp: false,
    allowGoogle: false,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const SignInForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'customer';
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    ['customer', 'worker', 'admin'].includes(initialRole) ? initialRole : 'customer'
  );

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, dismissToast } = useToast();

  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Keep selectedRole in sync if URL query parameter changes
  React.useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    if (roleParam && ['customer', 'worker', 'admin'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const currentRoleConfig = roleConfig[selectedRole];

  // ─── Sign In ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await signIn({
      ...data,
      role: selectedRole,
    });
    setLoading(false);

    if (!result.success) {
      addToast('error', result.error ?? 'Sign in failed.');
      return;
    }

    setSuccess(true);
    const detectedRole = (result as any).role || selectedRole || 'customer';
    const destination = getRoleRedirect(detectedRole);
    setTimeout(() => navigate(destination), 600);
  };

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (!result.success) {
      setGoogleLoading(false);
      addToast('error', result.error ?? 'Google sign-in failed.');
    }
  };

  return (
    <>
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <div className="px-7 sm:px-8 py-8 space-y-6">
        {/* Role Switcher Tabs */}
        <RoleSelector
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          isSignUp={false}
        />

        {/* Dynamic Heading with Cross-fade transition */}
        <div className="space-y-1.5 min-h-[58px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRole}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {currentRoleConfig.title}
                </h1>
                {currentRoleConfig.badge && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <Shield className="w-3 h-3" />
                    {currentRoleConfig.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                {currentRoleConfig.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Admin Callout Notice */}
        {selectedRole === 'admin' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] flex items-start gap-2.5 text-xs text-amber-200/90"
          >
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Admin access is restricted to verified personnel with pre-assigned credentials.
            </span>
          </motion.div>
        )}

        {/* Form */}
        <form method="POST" action="#" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="on" className="space-y-4">
          <FloatingInput
            label={selectedRole === 'admin' ? 'Admin Email' : 'Email'}
            type="email"
            autoComplete="username"
            error={errors.email?.message}
            registration={register('email')}
          />

          <div>
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              error={errors.password?.message}
              registration={register('password')}
            />

            {/* Forgot password */}
            <div className="flex justify-end mt-2">
              <Link
                to="/auth/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <PrimaryButton loading={loading} success={success} disabled={loading || success}>
            {selectedRole === 'admin' ? 'Sign In to Admin Portal' : 'Sign In'}
          </PrimaryButton>
        </form>

        {/* Google OAuth (Customer / Worker only) */}
        {currentRoleConfig.allowGoogle && authConfig.enableGoogleAuth && (
          <>
            <AuthDivider />
            <GoogleButton
              onClick={handleGoogle}
              loading={googleLoading}
              disabled={loading || success}
            />
          </>
        )}

        {/* Sign up link (Customer / Worker) vs Admin notice */}
        {currentRoleConfig.allowSignUp ? (
          <p className="text-center text-xs sm:text-sm text-white/40">
            Don't have an account?{' '}
            <Link
              to={`/auth/signup?role=${selectedRole}`}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors focus:outline-none focus:underline"
            >
              Create {selectedRole === 'worker' ? 'Worker' : 'Customer'} Account
            </Link>
          </p>
        ) : (
          <p className="text-center text-[11px] text-white/30">
            Need administrator credentials? Contact system governance.
          </p>
        )}
      </div>
    </>
  );
};

export default SignInForm;
