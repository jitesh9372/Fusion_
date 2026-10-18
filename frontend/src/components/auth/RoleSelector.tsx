import React from 'react';
import { motion } from 'framer-motion';
import { User, Zap, Shield } from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isSignUp?: boolean;
}

interface RoleOption {
  id: UserRole;
  label: string;
  Icon: React.FC<{ className?: string }>;
  accentColor: string;
  badge?: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'customer',
    label: 'Customer',
    Icon: User,
    accentColor: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 'worker',
    label: 'Worker',
    Icon: Zap,
    accentColor: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'admin',
    label: 'Admin',
    Icon: Shield,
    accentColor: 'from-amber-500 to-orange-600',
    badge: 'Secure',
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
  isSignUp = false,
}) => {
  return (
    <div className="w-full space-y-2">
      {/* Tab bar container */}
      <div
        className="relative flex items-center p-1 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
        role="tablist"
        aria-label="Select Access Role"
      >
        {ROLES.map(role => {
          const isSelected = selectedRole === role.id;
          const { Icon } = role;

          return (
            <button
              key={role.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onRoleChange(role.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl
                text-xs font-semibold tracking-wide transition-colors duration-200 select-none
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                ${isSelected ? 'text-white' : 'text-white/45 hover:text-white/75'}
              `}
            >
              {/* Active animated sliding background pill */}
              {isSelected && (
                <motion.div
                  layoutId="activeRolePill"
                  className={`
                    absolute inset-0 rounded-xl shadow-lg border border-white/20
                    bg-gradient-to-r ${role.accentColor}
                  `}
                  style={{
                    boxShadow: role.id === 'admin'
                      ? '0 0 20px rgba(245, 158, 11, 0.35)'
                      : role.id === 'worker'
                      ? '0 0 20px rgba(217, 70, 239, 0.35)'
                      : '0 0 20px rgba(99, 102, 241, 0.35)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Tab Icon and Label */}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-white/50'}`} />
                <span>{role.label}</span>
                {role.badge && (
                  <span
                    className={`
                      text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold
                      ${isSelected ? 'bg-black/30 text-white' : 'bg-amber-500/20 text-amber-300'}
                    `}
                  >
                    {role.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
