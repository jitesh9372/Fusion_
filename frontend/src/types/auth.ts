import type { UserRole, UserProfile } from './user';

export type { UserRole, UserProfile };

// ─── Auth User (from Supabase) ────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string | undefined;
  email_confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
  };
  app_metadata: {
    provider?: string;
    providers?: string[];
    role?: UserRole;
  };
}

// ─── Auth Session ─────────────────────────────────────────────────────────────
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

// ─── Auth State ───────────────────────────────────────────────────────────────
export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  loadingProfile: boolean;
  isAuthenticated: boolean;
}

// ─── Form Data ────────────────────────────────────────────────────────────────
export interface SignInData {
  email: string;
  password: string;
  role?: UserRole;
}

export interface SignUpData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role?: UserRole;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
  confirm_password: string;
}

// ─── Auth Context Value ───────────────────────────────────────────────────────
export interface AuthContextValue extends AuthState {
  signIn: (data: SignInData) => Promise<AuthServiceResult>;
  signUp: (data: SignUpData) => Promise<AuthServiceResult>;
  signInWithGoogle: () => Promise<AuthServiceResult>;
  signOut: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<AuthServiceResult>;
  updatePassword: (data: UpdatePasswordData) => Promise<AuthServiceResult>;
  updateUserRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<UserProfile | null>;
}

// ─── Service Result ───────────────────────────────────────────────────────────
export interface AuthServiceResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
}

// ─── Password Strength ────────────────────────────────────────────────────────
export type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0–4
  label: string;
  color: string;
  percentage: number; // 0–100
}
