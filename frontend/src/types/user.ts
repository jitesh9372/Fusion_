/**
 * FUSION User & Role Types
 * Centralized definition for user roles, profiles, and role permissions.
 */

export type UserRole = 'customer' | 'worker' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  address?: string | null;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
}

export interface RoleConfigItem {
  id: UserRole;
  label: string;
  route: string;
  tagline: string;
  description: string;
  accentColor: {
    primary: string;
    gradient: string;
    border: string;
    glow: string;
    text: string;
    badge: string;
  };
  features: string[];
  cta: string;
}
