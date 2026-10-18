import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/common/Logo';
import AuthBackground from '@/components/auth/AuthBackground';
import { pageEnterVariants } from '@/animations/motionConfig';

/**
 * PlaceholderDashboard
 *
 * Temporary authenticated placeholder landing page.
 * Per specification: "At this stage, build ONLY the Authentication Module.
 * Do NOT build Customer, Worker, or Admin dashboards. Those will be added later.
 * For now, protected routes can point to a temporary placeholder page."
 */
const PlaceholderDashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  const userEmail = user?.email ?? 'User';
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail.split('@')[0];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 overflow-hidden text-white">
      <AuthBackground />

      <motion.div
        className="relative z-10 w-full max-w-xl p-8 sm:p-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-2xl space-y-8"
        variants={pageEnterVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Logo size="md" variant="light" animated showTagline={false} />
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Sign out of account"
          >
            <LogOut className="w-4 h-4 text-indigo-400" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Welcome Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Authenticated Session Active</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">{userName}</span>
          </h1>
          <p className="text-sm text-white/60">
            You have successfully authenticated with FUSION.
          </p>
        </div>

        {/* Session Info Card */}
        <div className="p-4 rounded-xl bg-surface-800/80 border border-white/5 space-y-2.5 text-xs text-white/70">
          <div className="flex items-center justify-between">
            <span className="text-white/40 font-medium">Account Email:</span>
            <span className="text-white/90 font-mono">{userEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 font-medium">User ID:</span>
            <span className="text-white/90 font-mono text-[11px] truncate max-w-[240px]">{user?.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 font-medium">Provider:</span>
            <span className="text-indigo-300 font-medium capitalize">{user?.app_metadata?.provider ?? 'Email / Password'}</span>
          </div>
        </div>

        {/* Modular Next Steps info */}
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Future Module Architecture</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            The authentication module is complete, modular, and ready. In upcoming phases, role-based onboarding (Customer / Worker / Cooperative Admin) will dynamically route sessions into their designated dashboards.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-white/30">
            FUSION Cooperative Marketplace &bull; Authentication Phase
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PlaceholderDashboard;
