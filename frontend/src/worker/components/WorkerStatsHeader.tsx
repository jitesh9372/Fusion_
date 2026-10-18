import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItemFadeUp } from '@/animations/motionConfig';
import {
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Star,
  IndianRupee,
  Briefcase,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { WorkerProfile } from '@/types/marketplace';

interface WorkerStatsHeaderProps {
  workerProfile: WorkerProfile | null;
  isAvailable: boolean;
  onToggleAvailability: () => void;
  walletBalance: number;
  activeJobsCount: number;
}

export const WorkerStatsHeader: React.FC<WorkerStatsHeaderProps> = ({
  workerProfile,
  isAvailable,
  onToggleAvailability,
  walletBalance,
  activeJobsCount,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] p-6 sm:p-8 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#EEF1EE]/50 via-transparent to-[#4A6741]/5 pointer-events-none rounded-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Worker Info & Verified Badge */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#4A6741] flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-[#4A6741]/25">
            {workerProfile?.full_name?.charAt(0) || 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#1B2420]">
                {workerProfile?.full_name || 'Verified Cooperative Specialist'}
              </h1>
              {workerProfile?.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Artisan
                </span>
              )}
            </div>
            <p className="text-xs text-[#3A423E] mt-0.5">
              {workerProfile?.trade_category || 'General Craft'} Specialist •{' '}
              {workerProfile?.experience_years ?? 0} Years Certified Experience
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEF1EE] border border-[#D8D3C7] text-[10px] font-bold text-[#14524C]">
                <Sparkles className="w-3 h-3 text-[#D68C31]" />
                FUSION Cooperative Artisan
              </span>
            </div>
          </div>
        </div>

        {/* Online Status Toggle */}
        <motion.button
          type="button"
          onClick={onToggleAvailability}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all shadow-sm ${
            isAvailable
              ? 'bg-[#4A6741]/10 border-[#4A6741]/40 text-[#4A6741]'
              : 'bg-[#EEF1EE] border-[#D8D3C7] text-[#3A423E]'
          }`}
        >
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">
              Dispatch Radar
            </span>
            <span className="text-xs font-extrabold">
              {isAvailable ? '🟢 ONLINE & ACCEPTING JOBS' : '🔴 OFFLINE / ON BREAK'}
            </span>
          </div>
          {isAvailable ? (
            <ToggleRight className="w-7 h-7 text-[#4A6741]" />
          ) : (
            <ToggleLeft className="w-7 h-7 text-[#3A423E]/50" />
          )}
        </motion.button>
      </div>

      {/* Quick Metrics Bar with Staggered Entrance */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-[#D8D3C7] text-xs"
      >
        <motion.div
          variants={staggerItemFadeUp}
          whileHover={{ y: -2, scale: 1.01 }}
          className="p-3.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] space-y-1 transition-colors"
        >
          <span className="text-[#3A423E] text-[10px] block uppercase font-bold">Hourly Rate</span>
          <span className="text-base font-extrabold text-[#1B2420] flex items-center gap-0.5">
            <IndianRupee className="w-4 h-4" />
            {workerProfile?.hourly_rate || 0}/hr
          </span>
        </motion.div>
        <motion.div
          variants={staggerItemFadeUp}
          whileHover={{ y: -2, scale: 1.01 }}
          className="p-3.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] space-y-1 transition-colors"
        >
          <span className="text-[#3A423E] text-[10px] block uppercase font-bold">Customer Rating</span>
          <span className="text-base font-extrabold text-[#D68C31] flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#D68C31]" />
            {workerProfile?.rating ? Number(workerProfile.rating).toFixed(1) : '—'} / 5.0
          </span>
        </motion.div>
        <motion.div
          variants={staggerItemFadeUp}
          whileHover={{ y: -2, scale: 1.01 }}
          className="p-3.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] space-y-1 transition-colors"
        >
          <span className="text-[#3A423E] text-[10px] block uppercase font-bold">Active Jobs</span>
          <span className="text-base font-extrabold text-[#14524C] flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            {activeJobsCount} In Progress
          </span>
        </motion.div>
        <motion.div
          variants={staggerItemFadeUp}
          whileHover={{ y: -2, scale: 1.01 }}
          className="p-3.5 rounded-2xl bg-[#4A6741]/10 border border-[#4A6741]/30 space-y-1 transition-colors"
        >
          <span className="text-[#4A6741] text-[10px] block uppercase font-bold">Withdrawable</span>
          <span className="text-base font-extrabold text-[#4A6741] flex items-center gap-0.5">
            <IndianRupee className="w-4 h-4" />
            {walletBalance.toFixed(2)}
          </span>
        </motion.div>
      </motion.div>

    </motion.div>
  );
};

export default WorkerStatsHeader;
