import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/services/profileService';
import getRoleRedirect from '@/utils/roleRedirect';
import AuthBackground from '@/components/auth/AuthBackground';
import Logo from '@/components/common/Logo';

/**
 * AuthCallbackPage
 *
 * Handles OAuth redirects (e.g., Google OAuth) by confirming the session,
 * retrieving the user's role from Supabase, and redirecting directly to the
 * corresponding role dashboard.
 */
const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setErrorMsg(error.message);
          setTimeout(() => navigate('/auth/signin'), 3000);
          return;
        }

        const resolveAndRedirect = async (sessionUser: any) => {
          if (!sessionUser) {
            navigate('/auth/signin', { replace: true });
            return;
          }

          if (sessionUser.email?.toLowerCase() === 'administrator26@gmail.com') {
            navigate('/admin/dashboard', { replace: true });
            return;
          }

          const profile = await fetchProfile(sessionUser.id);
          const destination = getRoleRedirect(profile?.role);
          navigate(destination, { replace: true });
        };

        if (data.session) {
          await resolveAndRedirect(data.session.user);
        } else {
          // If no session found yet, subscribe to onAuthStateChange
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              await resolveAndRedirect(session.user);
            }
          });

          // Fallback timeout
          setTimeout(() => {
            subscription.unsubscribe();
            navigate('/auth/signin', { replace: true });
          }, 5000);
        }
      } catch (err) {
        console.error('Error handling auth callback:', err);
        setErrorMsg('Authentication failed. Redirecting to sign in...');
        setTimeout(() => navigate('/auth/signin'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 overflow-hidden text-white">
      <AuthBackground />

      <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
        <Logo size="lg" variant="light" animated showTagline />

        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm">
          {errorMsg ? (
            <>
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-lg font-bold">
                !
              </div>
              <p className="text-sm text-red-300">{errorMsg}</p>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500/40 border-t-indigo-500 animate-spin" />
              <p className="text-sm text-white/80 font-medium">Completing authentication...</p>
              <p className="text-xs text-white/40">Securing your session and routing to dashboard.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
