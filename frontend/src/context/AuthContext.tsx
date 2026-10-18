import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { supabase } from '@/lib/supabase';
import * as authService from '@/services/authService';
import * as profileService from '@/services/profileService';
import type {
  AuthContextValue,
  AuthUser,
  AuthSession,
  UserProfile,
  UserRole,
  SignInData,
  SignUpData,
  ResetPasswordData,
  UpdatePasswordData,
  AuthServiceResult,
} from '@/types/auth';

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ─── Load User Profile ──────────────────────────────────────────────────────
  const loadProfile = useCallback(async (
    userId: string,
    userEmail?: string,
    fullName?: string,
    metaRole?: UserRole
  ) => {
    setLoadingProfile(true);
    try {
      let p = await profileService.fetchProfile(userId);
      if (!p && userEmail) {
        // Create initial profile row directly in Supabase if missing, preserving worker/admin/customer role
        const fallbackRole: UserRole =
          userEmail.toLowerCase() === profileService.ADMIN_EMAIL
            ? 'admin'
            : (metaRole || 'customer');
        p = await profileService.createProfile(userId, userEmail, fullName, fallbackRole);
      } else if (p && !p.role && metaRole) {
        const updateRes = await profileService.updateRole(userId, metaRole);
        if (updateRes.success && updateRes.profile) {
          p = updateRes.profile;
        }
      }
      setProfile(p);
      return p;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // ─── Initialize Auth State ──────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const currentSession = await authService.getSession();
        if (mounted) {
          setSession(currentSession as AuthSession | null);
          const currentUser = currentSession?.user as AuthUser | null ?? null;
          setUser(currentUser);

          if (currentUser) {
            const userMeta = currentUser.user_metadata as Record<string, any> | undefined;
            const appMeta = (currentUser as any).app_metadata as Record<string, any> | undefined;
            const userMetaRole = (userMeta?.role as UserRole) || (appMeta?.role as UserRole);
            await loadProfile(
              currentUser.id,
              currentUser.email,
              userMeta?.full_name || userMeta?.name,
              userMetaRole
            );
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error initializing session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // ─── Auth State Listener ──────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession as AuthSession | null);
        const currentUser = newSession?.user as AuthUser | null ?? null;
        setUser(currentUser);

        if (currentUser) {
          const userMeta = currentUser.user_metadata as Record<string, any> | undefined;
          const appMeta = (currentUser as any).app_metadata as Record<string, any> | undefined;
          const userMetaRole = (userMeta?.role as UserRole) || (appMeta?.role as UserRole);
          await loadProfile(
            currentUser.id,
            currentUser.email,
            userMeta?.full_name || userMeta?.name,
            userMetaRole
          );
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const signIn = useCallback(
    async (data: SignInData): Promise<AuthServiceResult & { role?: UserRole | null }> => {
      const result = await authService.signIn(data);
      if (result.success && result.role) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          await loadProfile(
            currentUser.id,
            currentUser.email,
            currentUser.user_metadata?.full_name || currentUser.user_metadata?.name,
            result.role
          );
        }
      }
      return result;
    },
    [loadProfile]
  );

  const signUp = useCallback(
    async (data: SignUpData): Promise<AuthServiceResult & { role?: UserRole }> => {
      const result = await authService.signUp(data);
      if (result.success && result.role) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          await loadProfile(
            currentUser.id,
            currentUser.email,
            data.full_name,
            result.role
          );
        }
      }
      return result;
    },
    [loadProfile]
  );

  const signInWithGoogle = useCallback(
    (): Promise<AuthServiceResult> => authService.signInWithGoogle(),
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(
    (data: ResetPasswordData): Promise<AuthServiceResult> => authService.resetPassword(data),
    []
  );

  const updatePassword = useCallback(
    (data: UpdatePasswordData): Promise<AuthServiceResult> => authService.updatePassword(data),
    []
  );

  const updateUserRole = useCallback(
    async (role: UserRole): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: 'User is not authenticated.' };
      }

      const res = await profileService.updateRole(user.id, role);
      if (res.success && res.profile) {
        setProfile(res.profile);
      }
      return res;
    },
    [user]
  );

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;
    return loadProfile(
      user.id,
      user.email,
      user.user_metadata?.full_name || user.user_metadata?.name
    );
  }, [user, loadProfile]);

  // ─── Memoized Context Value ─────────────────────────────────────────────────
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      role: profile?.role ?? null,
      loading,
      loadingProfile,
      isAuthenticated: !!user && !!session,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      updateUserRole,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      loadingProfile,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      updateUserRole,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
