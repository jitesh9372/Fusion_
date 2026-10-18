import { supabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/types/user';

/**
 * FUSION Profile Service
 * Communicates with Supabase `profiles` table to manage user role and profile state.
 */

export const ADMIN_EMAIL = 'administrator26@gmail.com';

/**
 * Fetches the user profile by user ID from Supabase.
 */
export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[ProfileService] Error fetching profile:', error);
      return null;
    }

    // Ensure administrator26@gmail.com always carries admin role
    if (data?.email?.toLowerCase() === ADMIN_EMAIL && data.role !== 'admin') {
      data.role = 'admin';
      supabase.from('profiles').update({ role: 'admin' }).eq('id', userId).then();
    }

    return data as UserProfile;
  } catch (err) {
    console.error('[ProfileService] Unexpected error fetching profile:', err);
    return null;
  }
};

/**
 * Creates or upserts a user profile in Supabase.
 * If role is 'worker', saves role="worker".
 */
export const createProfile = async (
  userId: string,
  email: string,
  fullName?: string,
  role?: UserRole
): Promise<UserProfile | null> => {
  try {
    const effectiveRole: UserRole =
      email.toLowerCase() === ADMIN_EMAIL
        ? 'admin'
        : (role || 'customer');
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName ?? null,
          role: effectiveRole,
          updated_at: now,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[ProfileService] Error creating profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('[ProfileService] Unexpected error creating profile:', err);
    return null;
  }
};

/**
 * Ensures a profile exists in Supabase, creating it if missing.
 * If existing profile has no role, updates it to the fallback role.
 */
export const ensureProfile = async (
  userId: string,
  email: string,
  fullName?: string,
  fallbackRole?: UserRole
): Promise<UserProfile | null> => {
  let profile = await fetchProfile(userId);
  if (!profile) {
    profile = await createProfile(userId, email, fullName, fallbackRole);
  } else if (!profile.role && fallbackRole) {
    const res = await updateRole(userId, fallbackRole);
    if (res.success && res.profile) {
      profile = res.profile;
    }
  }
  return profile;
};

/**
 * Updates the user's role in their `profiles` row.
 */
export const updateRole = async (
  userId: string,
  role: UserRole
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
  try {
    if (role === 'admin') {
      const adminAuth = await verifyAdminAccess(userId);
      if (!adminAuth.authorized) {
        return {
          success: false,
          error: adminAuth.error ?? 'Admin access requires authorization from platform governance.',
        };
      }
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role,
        updated_at: now,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[ProfileService] Error updating role:', error);
      return { success: false, error: 'Failed to save role. Please try again.' };
    }

    return { success: true, profile: data as UserProfile };
  } catch (err) {
    console.error('[ProfileService] Unexpected error updating role:', err);
    return { success: false, error: 'A network error occurred while saving your role.' };
  }
};

/**
 * Verifies if a user is authorized for the Admin role.
 */
export const verifyAdminAccess = async (
  userId: string
): Promise<{ authorized: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return { authorized: false, error: 'Authentication required for admin verification.' };
    }

    const isEmailAdmin =
      user.email?.toLowerCase() === ADMIN_EMAIL ||
      user.email?.endsWith('@fusion.app') ||
      user.email?.includes('admin');
    const isAdminMeta =
      user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';

    if (isEmailAdmin || isAdminMeta) {
      return { authorized: true };
    }

    return {
      authorized: false,
      error: 'Admin access requires authorization. Please sign in with administrator credentials.',
    };
  } catch {
    return { authorized: false, error: 'Could not verify administrator privileges.' };
  }
};

/**
 * Updates full user profile details.
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[ProfileService] Error updating profile:', error);
      return null;
    }
    return data as UserProfile;
  } catch (err) {
    console.error('[ProfileService] Unexpected error updating profile:', err);
    return null;
  }
};

