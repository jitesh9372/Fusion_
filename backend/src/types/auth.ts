/**
 * Shared TypeScript types for the FUSION backend authentication layer.
 * These are ready to be extended when roles, profiles, and onboarding are added.
 */

export type UserRole = 'customer' | 'worker' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedRequest {
  userId: string;
  email: string;
  role?: UserRole;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
