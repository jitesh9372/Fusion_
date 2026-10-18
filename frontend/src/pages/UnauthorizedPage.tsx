import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleRedirect } from '@/utils/roleRedirect';
import AuthBackground from '@/components/auth/AuthBackground';
import Logo from '@/components/common/Logo';

export const UnauthorizedPage: React.FC = () => {
  const { role, signOut, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = React.useState(false);

  const handleReturnDashboard = () => {
    navigate(getRoleRedirect(role), { replace: true });
  };

  const handleSwitchToWorker = async () => {
    setSwitching(true);
    await updateUserRole('worker');
    setSwitching(false);
    navigate('/worker/dashboard', { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/signin');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 overflow-hidden text-white bg-[#0a0a0f]">
      <AuthBackground />

      <motion.div
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl border border-red-500/20 bg-white/[0.04] backdrop-blur-2xl shadow-2xl space-y-7 text-center"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          boxShadow: '0 0 50px rgba(239, 68, 68, 0.12), 0 25px 80px rgba(0, 0, 0, 0.7)',
        }}
      >
        <Logo size="md" variant="light" animated={false} showTagline={false} className="mx-auto" />

        {/* Animated Shield / Lock */}
        <motion.div
          className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0px rgba(239, 68, 68, 0.2)',
              '0 0 25px rgba(239, 68, 68, 0.4)',
              '0 0 0px rgba(239, 68, 68, 0.2)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </motion.div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Access Restricted</h1>
          <p className="text-sm text-white/55 leading-relaxed">
            You are currently signed in with role{' '}
            <span className="text-indigo-300 font-semibold uppercase tracking-wider text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30">
              {role || 'Customer'}
            </span>
            .
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleSwitchToWorker}
            disabled={switching}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-fuchsia-500/20 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          >
            <span>{switching ? 'Switching...' : 'Switch to Worker Workspace'}</span>
          </button>

          <button
            type="button"
            onClick={handleReturnDashboard}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white/80 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Customer Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign In with Different Account</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
