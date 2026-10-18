import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthLoadingScreen from '@/components/common/AuthLoadingScreen';
import type { UserRole } from '@/types/user';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole | UserRole[];
}

/**
 * RoleRoute
 *
 * Strict authorization boundary:
 * 1. Verifies the user is authenticated (redirects to /auth/signin if not)
 * 2. If authenticated but role is not yet selected/saved, redirects to /select-role
 * 3. If user's role does not match allowedRole, redirects to /unauthorized
 * 4. Renders AuthLoadingScreen while checking session & profile
 */
export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRole }) => {
  const { isAuthenticated, role, loading, loadingProfile } = useAuth();
  const location = useLocation();

  if (loading || loadingProfile) {
    return (
      <AuthLoadingScreen
        message="Verifying workspace permissions..."
        submessage="Securing your access"
      />
    );
  }

  // Not signed in
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Signed in, but role is unset -> Default to customer role
  const effectiveRole = role || 'customer';

  const allowed = Array.isArray(allowedRole)
    ? allowedRole.includes(effectiveRole)
    : allowedRole === effectiveRole;

  // Signed in, but role is not authorized for this route -> Access Restricted
  if (!allowed) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
