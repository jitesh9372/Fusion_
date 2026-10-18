import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/common/Logo';
import type { UserRole } from '@/types/user';

interface DashboardNavbarProps {
  role: UserRole;
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  onComingSoon: (featureName: string) => void;
}

const roleConfig: Record<UserRole, { label: string; accentColor: string; dotColor: string; Icon: React.FC<{ className?: string }> }> = {
  customer: {
    label: 'Customer Portal',
    accentColor: '#14524C',
    dotColor: 'bg-[#14524C]',
    Icon: User,
  },
  worker: {
    label: 'Artisan Hub',
    accentColor: '#4A6741',
    dotColor: 'bg-[#4A6741]',
    Icon: Wrench,
  },
  admin: {
    label: 'Admin Console',
    accentColor: '#9C4A34',
    dotColor: 'bg-[#9C4A34]',
    Icon: ShieldCheck,
  },
};

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  role,
  onMobileMenuToggle,
  isMobileMenuOpen,
  onComingSoon,
}) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const config = roleConfig[role] || roleConfig.customer;

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';
  const userEmail = user?.email || profile?.email || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/auth/signin');
    } finally {
      setLoggingOut(false);
    }
  };

  const searchPlaceholder =
    role === 'customer'
      ? 'Search services, plumbers, electricians...'
      : role === 'worker'
      ? 'Search jobs, locations...'
      : 'Search users, bookings, services...';

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-[#FFFFFF] border-b border-[#D8D3C7] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300">
      {/* Left: Hamburger + Logo + Role Badge */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2.5 rounded-xl border text-[#3A423E] hover:text-[#14524C] bg-[#EEF1EE] border-[#D8D3C7] hover:border-[#14524C] transition-all duration-200 active:scale-95"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Logo size="md" variant="dark" animated={false} showTagline={false} />

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide ml-2 bg-[#EEF1EE] border-[#D8D3C7]">
          <span className={`w-2 h-2 rounded-full animate-pulse ${config.dotColor}`} />
          <span style={{ color: config.accentColor }}>{config.label}</span>
        </div>
      </div>

      {/* Center: Quick Search */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A423E] group-hover:text-[#14524C] transition-colors duration-200" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onClick={() => onComingSoon('Global Search')}
            readOnly
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border bg-[#EEF1EE] text-[#1B2420] placeholder-[#3A423E]/50 border-[#D8D3C7] hover:border-[#14524C] focus:border-[#14524C] hover:bg-[#FFFFFF] focus:outline-none cursor-pointer transition-all duration-200"
          />
        </div>
      </div>

      {/* Right: Notifications + User Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with animated pulse badge */}
        <motion.button
          type="button"
          onClick={() => onComingSoon('Notifications')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 rounded-xl border text-[#3A423E] hover:text-[#14524C] bg-[#EEF1EE] border-[#D8D3C7] hover:border-[#14524C] transition-colors duration-200"
          aria-label="View notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D68C31] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D68C31] ring-2 ring-[#FFFFFF]" />
          </span>
        </motion.button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            type="button"
            onClick={() => setDropdownOpen(o => !o)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border bg-[#EEF1EE] hover:bg-[#FFFFFF] border-[#D8D3C7] hover:border-[#14524C] text-[#1B2420] transition-colors duration-200 select-none focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-[#FFFFFF] transition-transform duration-200"
              style={{ backgroundColor: config.accentColor }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-sm font-semibold text-[#1B2420] max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#3A423E] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </motion.button>


          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 p-2 rounded-2xl border bg-[#FFFFFF] border-[#D8D3C7] text-[#1B2420] z-50 text-xs space-y-1 shadow-xl shadow-black/10"
              >
                {/* User info */}
                <div className="px-3 py-2.5 border-b border-[#D8D3C7] space-y-1">
                  <p className="font-semibold truncate text-[#1B2420]">{userName}</p>
                  <p className="text-[11px] truncate font-mono text-[#3A423E]">{userEmail}</p>
                  <div
                    className="inline-block text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border mt-1 bg-[#EEF1EE] border-[#D8D3C7]"
                    style={{ color: config.accentColor }}
                  >
                    {role.toUpperCase()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setDropdownOpen(false); onComingSoon('Profile Settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#3A423E] hover:text-[#14524C] hover:bg-[#EEF1EE] transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-[#14524C]" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setDropdownOpen(false); onComingSoon('Account Settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#3A423E] hover:text-[#14524C] hover:bg-[#EEF1EE] transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-[#14524C]" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setDropdownOpen(false); onComingSoon('Help & Support'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#3A423E] hover:text-[#14524C] hover:bg-[#EEF1EE] transition-colors text-left"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#14524C]" />
                  <span>Help & FAQ</span>
                </button>

                <div className="pt-1 border-t border-[#D8D3C7]">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9C4A34] hover:bg-[#9C4A34]/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
