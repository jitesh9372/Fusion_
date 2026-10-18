/**
 * FUSION Authentication Configuration
 * Toggle authentication features from this single file.
 * No auth component logic needs to change when toggling features.
 */

export const authConfig = {
  /** Enable Google OAuth button */
  enableGoogleAuth: true,

  /** Require email verification after signup */
  requireEmailVerification: false,

  /** Enable forgot/reset password flow */
  enablePasswordReset: true,

  /** Redirect path after sign in when role is not determined */
  postSignInRedirect: '/customer/dashboard',

  /** Redirect path after successful sign up */
  postSignUpRedirect: '/customer/dashboard',

  /** Redirect path after sign out */
  postSignOutRedirect: '/auth/signin',

  /** Minimum password length */
  minPasswordLength: 8,

  /** Resend verification email cooldown in seconds */
  resendCooldownSeconds: 30,

  /**
   * OAuth redirect URL — used by Supabase to redirect back after Google login.
   * Must be registered in your Supabase project's Auth → URL Configuration → Redirect URLs.
   */
  oauthRedirectUrl:
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:5173/auth/callback',
} as const;

export type AuthConfig = typeof authConfig;
