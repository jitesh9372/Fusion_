import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import type { UserProfile } from '@/types/auth';

interface CustomerProfileTabProps {
  profile: UserProfile | null;
  profileName: string;
  setProfileName: (name: string) => void;
  profilePhone: string;
  setProfilePhone: (phone: string) => void;
  profileAddress: string;
  setProfileAddress: (address: string) => void;
  profileSaving: boolean;
  onSaveProfile: (e: React.FormEvent) => void;
}

export const CustomerProfileTab: React.FC<CustomerProfileTabProps> = ({
  profile,
  profileName,
  setProfileName,
  profilePhone,
  setProfilePhone,
  profileAddress,
  setProfileAddress,
  profileSaving,
  onSaveProfile,
}) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1B2420] tracking-tight">Customer Profile Settings</h1>
        <p className="text-xs text-[#3A423E]">
          Manage your personal information, contact credentials, and default address.
        </p>
      </div>

      <form
        onSubmit={onSaveProfile}
        className="p-8 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] space-y-5"
      >
        <div className="flex items-center gap-4 pb-4 border-b border-[#D8D3C7]">
          <div className="w-14 h-14 rounded-2xl bg-[#14524C] flex items-center justify-center font-black text-[#FFFFFF] text-xl">
            {profileName.charAt(0) || 'C'}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1B2420]">{profileName || 'Customer Member'}</h3>
            <span className="text-xs text-[#4A6741] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Cooperative Member
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#3A423E]">Full Name</label>
          <input
            type="text"
            required
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] text-xs focus:outline-none focus:border-[#14524C]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#3A423E]">Email Address (Immutable)</label>
          <input
            type="email"
            disabled
            value={profile?.email || ''}
            className="w-full px-4 py-2.5 bg-[#EEF1EE]/40 border border-[#D8D3C7]/60 rounded-xl text-[#3A423E] text-xs cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#3A423E]">Contact Phone Number</label>
          <input
            type="tel"
            value={profilePhone}
            onChange={e => setProfilePhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] text-xs focus:outline-none focus:border-[#14524C]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#3A423E]">Default Residential Address</label>
          <input
            type="text"
            value={profileAddress}
            onChange={e => setProfileAddress(e.target.value)}
            placeholder="Street, City, Postal Code"
            className="w-full px-4 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] text-xs focus:outline-none focus:border-[#14524C]"
          />
        </div>

        <div className="pt-3">
          <motion.button
            type="submit"
            disabled={profileSaving}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-2xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-bold text-xs transition-colors disabled:opacity-50 shadow-sm"
          >
            {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfileTab;
