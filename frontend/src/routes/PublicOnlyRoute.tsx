import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getRoleRedirect } from '@/utils/roleRedirect';
import AuthLoadingScreen from '@/components/common/AuthLoadingScreen';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * PublicOnlyRoute
 *
 * Redirects already-authenticated users away from auth pages (/auth/signin, /auth/signup)
 * to their specific role dashboard or role selection page.
 */
export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    // If the user came from an attempted protected route, return them there
    const from = (location.state as { from?: Location })?.from?.pathname;
    const destination = from ?? getRoleRedirect(role);
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

export default PublicOnlyRoute;
