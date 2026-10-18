import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authConfig } from '@/config/authConfig';
import getRoleRedirect from '@/utils/roleRedirect';
import FloatingInput from './FloatingInput';
import PasswordInput from './PasswordInput';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import PrimaryButton from './PrimaryButton';
import GoogleButton from './GoogleButton';
import AuthDivider from './AuthDivider';
import AuthToast, { useToast } from './AuthToast';
import RoleSelector from './RoleSelector';
import type { UserRole } from '@/types/auth';

// ─── Validation Schema ────────────────────────────────────────────────────────
const schema = z
  .object({
    full_name: z.string().min(1, 'Full name is required.'),
    email: z.string().email('Enter a valid email address.'),
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
const SignUpForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'customer';
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    ['customer', 'worker', 'admin'].includes(initialRole) ? initialRole : 'customer'
  );

  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, dismissToast } = useToast();

  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

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

  // ─── Sign Up ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await signUp({
      ...data,
      role: selectedRole,
    });
    setLoading(false);

    if (!result.success) {
      addToast('error', result.error ?? 'Sign up failed.');
      return;
    }

    setSuccess(true);
    addToast('success', 'Account created successfully!');
    const destination = getRoleRedirect((result as any).role || selectedRole);
    setTimeout(() => navigate(destination), 800);
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
        {/* Role Selector Tabs */}
        <RoleSelector
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          isSignUp={true}
        />

        {/* Dynamic Heading based on role */}
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
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {selectedRole === 'worker'
                  ? 'Join as a Skilled Worker'
                  : selectedRole === 'admin'
                  ? 'Admin Portal'
                  : 'Create your Customer account'}
              </h1>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                {selectedRole === 'worker'
                  ? 'Offer your services, find work opportunities, and grow.'
                  : selectedRole === 'admin'
                  ? 'Admin accounts are assigned by system governance.'
                  : 'Join a trusted community of cooperative service customers.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* If Admin is selected on Sign Up */}
        {selectedRole === 'admin' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white">Restricted Admin Access</h3>
              <p className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto">
                Admin accounts cannot be self-registered. Please sign in with your pre-assigned administrator credentials.
              </p>
            </div>

            <Link
              to="/auth/signin?role=admin"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
            >
              <span>Go to Admin Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          /* Normal Customer / Worker Signup Form */
          <>
            <form method="POST" action="#" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="on" className="space-y-4">
              <FloatingInput
                label="Full Name"
                type="text"
                autoComplete="name"
                error={errors.full_name?.message}
                registration={register('full_name')}
              />

              <FloatingInput
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                registration={register('email')}
              />

              <div>
                <PasswordInput
                  label="Password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  registration={register('password')}
                  onChange={(e) => setPasswordValue(e.target.value)}
                />
                <PasswordStrengthMeter password={passwordValue} />
              </div>

              <PasswordInput
                label="Confirm Password"
                autoComplete="new-password"
                error={errors.confirm_password?.message}
                registration={register('confirm_password')}
              />

              <PrimaryButton loading={loading} success={success} disabled={loading || success}>
                {selectedRole === 'worker' ? 'Create Worker Account' : 'Create Customer Account'}
              </PrimaryButton>
            </form>

            {/* Google OAuth */}
            {authConfig.enableGoogleAuth && (
              <>
                <AuthDivider />
                <GoogleButton
                  onClick={handleGoogle}
                  loading={googleLoading}
                  disabled={loading || success}
                />
              </>
            )}

            {/* Sign in link */}
            <p className="text-center text-xs sm:text-sm text-white/40">
              Already have an account?{' '}
              <Link
                to={`/auth/signin?role=${selectedRole}`}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors focus:outline-none focus:underline"
              >
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default SignUpForm;
