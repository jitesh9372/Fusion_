import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import getRoleRedirect from '@/utils/roleRedirect';

/**
 * Email verification is disabled in Supabase.
 * This page now acts as a redirect passthrough:
 * - Authenticated users → their role dashboard
 * - Unauthenticated users → sign in page
 */
const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && role) {
      navigate(getRoleRedirect(role), { replace: true });
    } else {
      navigate('/auth/signin', { replace: true });
    }
  }, [isAuthenticated, role, loading, navigate]);

  return null;
};

export default VerifyEmailPage;
