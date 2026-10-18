import type { UserRole, RoleConfigItem } from '@/types/user';

/**
 * FUSION Role Configuration
 * Central single-source-of-truth for all role definitions, routes,
 * accent palettes, descriptions, and feature lists.
 */

export const roleConfig: Record<UserRole, RoleConfigItem> = {
  customer: {
    id: 'customer',
    label: 'Customer',
    route: '/customer/dashboard',
    tagline: 'Access Trusted Services',
    description: 'Find trusted, verified professionals for your everyday service needs.',
    accentColor: {
      primary: '#6366f1',
      gradient: 'from-blue-500 via-indigo-500 to-cyan-500',
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      glow: 'rgba(6, 182, 212, 0.35)',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    },
    features: [
      'Book verified skilled professionals',
      'Live service tracking & status',
      'Transparent cooperative pricing',
      'Rate, review & support local workers',
    ],
    cta: 'Continue as Customer',
  },

  worker: {
    id: 'worker',
    label: 'Worker',
    route: '/worker/dashboard',
    tagline: 'Empower Your Craft',
    description: 'Grow your opportunities, manage your jobs and build your professional profile.',
    accentColor: {
      primary: '#d946ef',
      gradient: 'from-fuchsia-500 via-purple-500 to-pink-500',
      border: 'border-fuchsia-500/30 hover:border-fuchsia-400/60',
      glow: 'rgba(217, 70, 239, 0.35)',
      text: 'text-fuchsia-400',
      badge: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
    },
    features: [
      'Receive instant job requests',
      'Manage availability & schedule',
      'Direct payouts & earnings tracking',
      'Access training & cooperative welfare',
    ],
    cta: 'Continue as Worker',
  },

  admin: {
    id: 'admin',
    label: 'Admin',
    route: '/admin/dashboard',
    tagline: 'Platform Governance',
    description: 'Manage the FUSION cooperative ecosystem and monitor platform operations.',
    accentColor: {
      primary: '#f59e0b',
      gradient: 'from-amber-500 via-indigo-600 to-blue-600',
      border: 'border-amber-500/30 hover:border-amber-400/60',
      glow: 'rgba(245, 158, 11, 0.35)',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    features: [
      'Worker onboarding & certification verification',
      'Monitor bookings & dispute resolution',
      'Real-time ecosystem analytics',
      'Platform policy & cooperative settings',
    ],
    cta: 'Continue as Admin',
  },
};

export const ALL_ROLES: UserRole[] = ['customer', 'worker', 'admin'];
