import { supabase } from '@/lib/supabase';
import { authConfig } from '@/config/authConfig';
import type {
  SignInData,
  SignUpData,
  ResetPasswordData,
  UpdatePasswordData,
  AuthServiceResult,
  UserRole,
} from '@/types/auth';

/**
 * FUSION Auth Service
 *
 * All Supabase Auth calls are centralized here.
 * UI components call this service, keeping auth decoupled and testable.
 */

// ─── Sign In ──────────────────────────────────────────────────────────────────
export const signIn = async ({
  email,
  password,
  role: requestedRole,
}: SignInData): Promise<AuthServiceResult & { role?: UserRole | null; user?: any; session?: any }> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  // Fetch canonical profile role directly from Supabase database
  let role: UserRole | null = null;
  if (data?.user) {
    if (data.user.email?.toLowerCase() === 'administrator26@gmail.com') {
      role = 'admin';
    } else {
      // Query profiles table in Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role as UserRole;
      } else {
        // Fallback: If profile row is missing in Supabase, create it with user's metadata role or requested role
        const fallbackRole: UserRole =
          (data.user.user_metadata?.role as UserRole) ||
          (data.user.app_metadata?.role as UserRole) ||
          requestedRole ||
          'customer';

        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              email: data.user.email ?? email,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
              role: fallbackRole,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
          .select('role')
          .single();

        role = (newProfile?.role as UserRole) ?? fallbackRole;
      }
    }
  }

  return { success: true, role, user: data?.user, session: data?.session };
};


// ─── Sign Up ──────────────────────────────────────────────────────────────────
export const signUp = async ({
  email,
  password,
  full_name,
  role = 'customer',
}: SignUpData): Promise<AuthServiceResult & { role?: UserRole }> => {
  // If administrator email, assign admin role
  const effectiveRole: UserRole =
    email.toLowerCase() === 'administrator26@gmail.com' ? 'admin' : role;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role: effectiveRole,
      },
      emailRedirectTo: authConfig.oauthRedirectUrl,
    },
  });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  // If user profile is immediately available, ensure profiles row matches
  if (data?.user) {
    try {
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          email: data.user.email ?? email,
          full_name,
          role: effectiveRole,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (effectiveRole === 'worker') {
        await supabase.from('workers').upsert(
          {
            user_id: data.user.id,
            full_name: full_name || email.split('@')[0],
            email: data.user.email ?? email,
            trade_category: 'Electricity',
            verification_status: 'pending',
            is_available: true,
            rating: 5.0,
            total_jobs: 0,
          },
          { onConflict: 'user_id' }
        );
      }
    } catch {
      // Ignored if handled by trigger
    }
  }

  // With email confirm disabled, Supabase should return a session immediately.
  // As a safety net, sign in explicitly so the session is always established.
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      // Non-fatal — the account was created; user can sign in manually
      console.warn('[authService] Auto sign-in after signup failed:', signInError.message);
    }
  }

  return {
    success: true,
    role: effectiveRole,
    requiresVerification: false,
  };
};


// ─── Google OAuth ─────────────────────────────────────────────────────────────
export const signInWithGoogle = async (): Promise<AuthServiceResult> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authConfig.oauthRedirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  return { success: true };
};

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

// ─── Reset Password (Send Email) ──────────────────────────────────────────────
export const resetPassword = async ({ email }: ResetPasswordData): Promise<AuthServiceResult> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  return { success: true };
};

// ─── Update Password (After Reset) ───────────────────────────────────────────
export const updatePassword = async ({
  password,
}: UpdatePasswordData): Promise<AuthServiceResult> => {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  return { success: true };
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// ─── Get Current Session ──────────────────────────────────────────────────────
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// ─── Resend Verification Email ────────────────────────────────────────────────
export const resendVerificationEmail = async (email: string): Promise<AuthServiceResult> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: authConfig.oauthRedirectUrl,
    },
  });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  return { success: true };
};

// ─── Error Message Mapping ────────────────────────────────────────────────────
const mapAuthError = (message: string): string => {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 8 characters and contain a number.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (lower.includes('oauth') || lower.includes('provider')) {
    return 'Google sign-in failed. Please try again or use email instead.';
  }

  return 'Something went wrong. Please try again.';
};
