import type { UserRole } from '@/types/user';
import { roleConfig } from '@/config/roleConfig';

/**
 * Resolves the destination dashboard route for a given user role.
 * Directly routes Customer, Worker, and Admin to their respective dashboards.
 * Defaults to Customer Dashboard (/customer/dashboard) if unset.
 *
 * @param role The authenticated user's role (customer | worker | admin | null)
 * @returns The destination pathname (e.g. /customer/dashboard)
 */
export function getRoleRedirect(role: UserRole | null | undefined): string {
  if (!role) {
    return '/customer/dashboard';
  }

  return roleConfig[role]?.route ?? '/customer/dashboard';
}

export default getRoleRedirect;
