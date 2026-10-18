import React from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wrench,
  Calendar,
  MessageSquare,
  CreditCard,
  Star,
  User,
  Settings,
  Briefcase,
  Clock,
  TrendingUp,
  GraduationCap,
  HeartHandshake,
  Users,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Sparkles,
  MapPin,
  Compass,
  Bell,
  Award,
  Wallet,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { UserRole } from '@/types/user';

export interface SidebarTabItem {
  id: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  badge?: string;
}

interface DashboardSidebarProps {
  role: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectTab?: (tabId: string) => void;
}

export const customerTabs: SidebarTabItem[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'services', label: 'Find Services', Icon: Wrench, badge: '9 Active' },
  { id: 'workers', label: 'Find Workers', Icon: Users },
  { id: 'bookings', label: 'My Bookings', Icon: Calendar },
  { id: 'tracking', label: 'Track Service', Icon: Activity, badge: 'Live' },
  { id: 'payments', label: 'Payments', Icon: CreditCard },
  { id: 'messages', label: 'Messages', Icon: MessageSquare },
  { id: 'reviews', label: 'Reviews', Icon: Star },
  { id: 'disputes', label: 'Disputes', Icon: AlertCircle },
  { id: 'profile', label: 'Profile', Icon: User },
];

export const workerTabs: SidebarTabItem[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', Icon: User },
  { id: 'verification', label: 'Verification', Icon: ShieldCheck, badge: 'Required' },
  { id: 'skills', label: 'Skills & Certificates', Icon: Award },
  { id: 'requests', label: 'Job Requests', Icon: Briefcase, badge: 'Matched' },
  { id: 'jobs', label: 'My Jobs', Icon: Calendar },
  { id: 'wallet', label: 'Wallet & Payouts', Icon: Wallet },
  { id: 'ratings', label: 'Ratings', Icon: Star },
  { id: 'welfare', label: 'Welfare Fund', Icon: HeartHandshake },
  { id: 'messages', label: 'Messages', Icon: MessageSquare },
];

export const adminTabs: SidebarTabItem[] = [
  { id: 'dashboard', label: 'Executive Console', Icon: LayoutDashboard },
  { id: 'workers', label: 'Workers Roster', Icon: Wrench },
  { id: 'customers', label: 'Customers', Icon: Users },
  { id: 'verification', label: 'Verification Queue', Icon: ShieldCheck, badge: 'Pending' },
  { id: 'services', label: 'Services Catalogue', Icon: Layers },
  { id: 'bookings', label: 'Bookings Oversight', Icon: Calendar },
  { id: 'payments', label: 'Payments & Treasury', Icon: CreditCard },
  { id: 'disputes', label: 'Disputes Arbitrator', Icon: AlertCircle },
  { id: 'welfare', label: 'Worker Welfare Fund', Icon: HeartHandshake },
  { id: 'analytics', label: 'Deep Analytics', Icon: BarChart3 },
  { id: 'settings', label: 'Ecosystem Policies', Icon: Settings },
];

// Role-specific accent colors for active states
const roleAccent: Record<UserRole, { active: string; activeText: string; activeBorder: string; activeIcon: string }> = {
  customer: {
    active: 'bg-[#14524C]',
    activeText: 'text-[#FFFFFF]',
    activeBorder: 'border-[#14524C]',
    activeIcon: 'text-[#FFFFFF]',
  },
  worker: {
    active: 'bg-[#4A6741]',
    activeText: 'text-[#FFFFFF]',
    activeBorder: 'border-[#4A6741]',
    activeIcon: 'text-[#FFFFFF]',
  },
  admin: {
    active: 'bg-[#9C4A34]',
    activeText: 'text-[#FFFFFF]',
    activeBorder: 'border-[#9C4A34]',
    activeIcon: 'text-[#FFFFFF]',
  },
};

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  role,
  isMobileOpen,
  onCloseMobile,
  onSelectTab,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const accent = roleAccent[role] || roleAccent.customer;

  // Extract active tab from pathname or query param
  const pathSegment = location.pathname.replace(`/${role}/`, '').replace(`/${role}`, '');
  const currentTab =
    pathSegment && pathSegment !== 'dashboard' && pathSegment !== ''
      ? pathSegment
      : searchParams.get('tab') || 'dashboard';

  const tabList =
    role === 'worker' ? workerTabs : role === 'admin' ? adminTabs : customerTabs;

  const handleTabClick = (tabId: string) => {
    if (role === 'customer') {
      navigate(`/customer/${tabId}`);
    } else if (role === 'worker') {
      navigate(`/worker/${tabId}`);
    } else if (role === 'admin') {
      navigate(`/admin/${tabId}`);
    } else {
      setSearchParams({ tab: tabId });
    }
    onSelectTab?.(tabId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 overflow-y-auto bg-[#EEF1EE] text-[#1B2420]">
      <div className="space-y-2">
        {/* Navigation Section Header */}
        <div className="px-3 py-2 text-[11px] uppercase font-extrabold tracking-wider flex items-center justify-between text-[#3A423E]">
          <span>{role.toUpperCase()} NAVIGATION</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#14524C] border border-[#D8D3C7]">
            {tabList.length} SECTIONS
          </span>
        </div>

        {/* Tab Items List */}
        <div className="space-y-1.5 pt-1">
          {tabList.map(item => {
            const { Icon } = item;
            const isActive = currentTab === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`
                  w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold
                  transition-all duration-200 select-none text-left relative group border
                  ${
                    isActive
                      ? `${accent.active} ${accent.activeText} ${accent.activeBorder} shadow-sm`
                      : 'text-[#3A423E] hover:text-[#14524C] hover:bg-[#FFFFFF] border-transparent hover:border-[#D8D3C7]'
                  }
                `}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? accent.activeIcon
                        : 'text-[#3A423E] group-hover:text-[#14524C]'
                    }`}
                  />
                  <span className="truncate tracking-tight">{item.label}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border transition-all ${
                        isActive
                          ? 'bg-[#FFFFFF]/25 text-[#FFFFFF] border-[#FFFFFF]/40'
                          : 'bg-[#FFFFFF] text-[#14524C] border-[#D8D3C7] group-hover:border-[#14524C]/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {!isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#3A423E]/30 group-hover:text-[#14524C] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Cooperative Card */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="mt-6 p-4 rounded-3xl border bg-[#FFFFFF] border-[#D8D3C7] text-[#1B2420] space-y-1.5"
      >
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#14524C]">
          <Sparkles className="w-4 h-4 text-[#D68C31]" />
          <span>FUSION Cooperative</span>
        </div>
        <p className="text-xs leading-relaxed font-medium text-[#3A423E]">
          Verified Trade Skills. 100% Escrow Protected Work.
        </p>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block border-r shrink-0 transition-all duration-300 w-72 bg-[#EEF1EE] border-[#D8D3C7]">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="fixed top-0 bottom-0 left-0 w-80 border-r z-50 lg:hidden bg-[#EEF1EE] border-[#D8D3C7]"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;
