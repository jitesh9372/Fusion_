import { supabaseAdmin } from '../config/supabase';
import { UserProfile, UserRole } from '../types/auth';

/**
 * FUSION Auth Service — Backend
 *
 * Handles auth-adjacent operations that require server-side privileges.
 * Pure Supabase Auth (sign in, sign up, OAuth) is handled client-side.
 * This service handles: profile management, role assignment, admin operations.
 */

/**
 * Creates a user profile record in the `profiles` table.
 * Called after Supabase Auth creates the user (via webhook or API route).
 */
export const createUserProfile = async (
  userId: string,
  email: string,
  fullName?: string,
  role: UserRole = 'customer'
): Promise<UserProfile> => {
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName ?? null,
      avatar_url: null,
      role,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  return data as UserProfile;
};

/**
 * Retrieves a user profile by their Supabase user ID.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data as UserProfile;
};

/**
 * Updates a user's role. Admin-only operation.
 * TODO: Add admin authorization check when role management is implemented.
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<UserProfile> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }

  return data as UserProfile;
};

/**
 * Deletes a user from Supabase Auth (admin operation).
 * Profile row will cascade-delete via database FK constraint.
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};
