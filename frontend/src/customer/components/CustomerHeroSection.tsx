import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  ArrowRight,
  User,
  Activity,
  ShieldCheck,
  Zap,
  Snowflake,
  Wrench,
  Paintbrush,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import type { BookingItem } from '@/types/marketplace';

interface CustomerHeroSectionProps {
  serviceSearch: string;
  setServiceSearch: (value: string) => void;
  setSelectedCategory: (cat: string) => void;
  navigateTab: (tab: string) => void;
  onOpenBookingModal: () => void;
  bookings: BookingItem[];
}

export const CustomerHeroSection: React.FC<CustomerHeroSectionProps> = ({
  serviceSearch,
  setServiceSearch,
  setSelectedCategory,
  navigateTab,
  onOpenBookingModal,
  bookings,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] p-6 sm:p-8 lg:p-10 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Hero Content Left */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF1EE] border border-[#D8D3C7] text-[#14524C] text-xs font-bold tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D68C31]" />
            <span>FUSION Cooperative Trade Marketplace</span>
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B2420] tracking-tight leading-tight">
              Skills. Services.{' '}
              <span className="text-[#14524C]">
                Stronger Communities.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#3A423E] leading-relaxed max-w-xl">
              Book verified trade artisans on demand with guaranteed 100% escrow protection, live step tracking, and cooperative fair pricing with 0% corporate middleman markup.
            </p>
          </div>

          {/* Smart Search Bar */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14524C]" />
            <input
              type="text"
              placeholder="Search electrician, AC repair, plumber, painter..."
              value={serviceSearch}
              onChange={e => setServiceSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') navigateTab('services');
              }}
              className="w-full pl-11 pr-28 py-3.5 text-xs sm:text-sm bg-[#EEF1EE]/70 hover:bg-[#EEF1EE] focus:bg-[#FFFFFF] border border-[#D8D3C7] focus:border-[#14524C] rounded-2xl text-[#1B2420] placeholder-[#3A423E]/60 focus:outline-none transition-all"
            />
            <motion.button
              type="button"
              onClick={() => navigateTab('services')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-bold text-xs transition-colors shadow-sm"
            >
              Search
            </motion.button>
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: '⚡ Electrician', cat: 'Electricity' },
              { label: '❄️ AC Repair', cat: 'AC Repair' },
              { label: '🎨 Painter', cat: 'Painting' },
              { label: '🧹 Cleaning', cat: 'Cleaning' },
              { label: '🔧 Plumbing', cat: 'Plumbing' },
            ].map(item => (
              <motion.button
                key={item.cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(item.cat);
                  navigateTab('services');
                }}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-3.5 py-1.5 rounded-xl bg-[#EEF1EE] hover:bg-[#14524C]/10 border border-[#D8D3C7] hover:border-[#14524C] text-xs text-[#3A423E] hover:text-[#14524C] font-semibold transition-all shadow-none"
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <motion.button
              type="button"
              onClick={onOpenBookingModal}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3.5 rounded-2xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm group"
            >
              <span>Book a Service</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigateTab('workers')}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-3.5 rounded-2xl bg-[#FFFFFF] hover:bg-[#EEF1EE] text-[#1B2420] border border-[#D8D3C7] hover:border-[#14524C] text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#14524C]" />
              <span>Find Verified Workers</span>
            </motion.button>
            {bookings.length > 0 && (
              <motion.button
                type="button"
                onClick={() => navigateTab('tracking')}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-3.5 rounded-2xl bg-[#4A6741]/10 hover:bg-[#4A6741]/20 text-[#4A6741] border border-[#4A6741]/30 text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-[#4A6741]" />
                <span>Track Order #{bookings[0].id.slice(-6)}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Clean Premium Artisan Matrix Right */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-3xl p-6 sm:p-7 bg-[#F4F6F4] border border-[#D8D3C7] space-y-5">
            {/* Header Badge Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A6741] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A6741]"></span>
                </span>
                <span className="text-xs font-bold text-[#4A6741] tracking-wide">
                  COOPERATIVE DISPATCH ACTIVE
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#D8D3C7] text-[#3A423E] font-bold">
                0% MIDDLEMAN MARKUP
              </span>
            </div>

            {/* Interactive Trade Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Electrical Systems', cat: 'Electricity', icon: Zap, color: 'text-[#D68C31]', bg: 'bg-[#D68C31]/10 border-[#D68C31]/30', count: '24 Artisans Near You' },
                { label: 'HVAC & AC Service', cat: 'AC Repair', icon: Snowflake, color: 'text-[#14524C]', bg: 'bg-[#14524C]/10 border-[#14524C]/30', count: '18 Artisans Near You' },
                { label: 'Master Plumbing', cat: 'Plumbing', icon: Wrench, color: 'text-[#14524C]', bg: 'bg-[#14524C]/10 border-[#14524C]/30', count: '15 Artisans Near You' },
                { label: 'Finishing & Painting', cat: 'Painting', icon: Paintbrush, color: 'text-[#D68C31]', bg: 'bg-[#D68C31]/10 border-[#D68C31]/30', count: '12 Artisans Near You' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.cat}
                    onClick={() => {
                      setSelectedCategory(item.cat);
                      navigateTab('services');
                    }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#EEF1EE] border border-[#D8D3C7] hover:border-[#14524C] cursor-pointer transition-all space-y-2 group"
                  >
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B2420] group-hover:text-[#14524C] transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-[10px] text-[#3A423E]">{item.count}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Live Metrics Strip */}
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#D8D3C7] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4A6741]" />
                <span className="text-[#3A423E]">Escrow Guarantee:</span>
                <span className="font-bold text-[#4A6741]">100% Protected</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#14524C] font-bold text-[11px]">
                <TrendingUp className="w-3.5 h-3.5 text-[#D68C31]" />
                <span>90% Fair Artisan Split</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerHeroSection;
