import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItemFadeUp } from '@/animations/motionConfig';
import { Search, User, ShieldCheck, Star, MapPin, IndianRupee, Calendar } from 'lucide-react';
import type { WorkerProfile } from '@/types/marketplace';

interface CustomerWorkerGridProps {
  workers: WorkerProfile[];
  workerSearch: string;
  setWorkerSearch: (value: string) => void;
  workerCategoryFilter: string;
  setWorkerCategoryFilter: (cat: string) => void;
  categories: string[];
  onBookWorker: (worker: WorkerProfile) => void;
}

export const CustomerWorkerGrid: React.FC<CustomerWorkerGridProps> = ({
  workers,
  workerSearch,
  setWorkerSearch,
  workerCategoryFilter,
  setWorkerCategoryFilter,
  categories,
  onBookWorker,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B2420] tracking-tight">
            Verified Cooperative Artisans
          </h1>
          <p className="text-xs text-[#3A423E]">
            Workers are filtered and certified strictly according to their verified trade skill.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14524C]" />
          <input
            type="text"
            placeholder="Search worker by name, skill..."
            value={workerSearch}
            onChange={e => setWorkerSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FFFFFF] border border-[#D8D3C7] focus:border-[#14524C] rounded-2xl text-[#1B2420] placeholder-[#3A423E]/60 focus:outline-none transition-all shadow-none"
          />
        </div>
      </div>

      {/* Trade Category Filter */}
      <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-1">
        {categories.map(cat => {
          const isSelected = workerCategoryFilter.toLowerCase() === cat.toLowerCase();
          return (
            <motion.button
              key={cat}
              type="button"
              onClick={() => setWorkerCategoryFilter(cat)}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-none ${
                isSelected
                  ? 'bg-[#14524C] text-[#FFFFFF] border border-[#14524C]'
                  : 'bg-[#FFFFFF] text-[#3A423E] hover:text-[#14524C] hover:bg-[#EEF1EE] border border-[#D8D3C7]'
              }`}
            >
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Workers Grid with Staggered Entrance */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {workers.length === 0 ? (
          <motion.div
            variants={staggerItemFadeUp}
            className="col-span-full p-12 text-center border border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-2"
          >
            <User className="w-8 h-8 text-[#3A423E]/50 mx-auto" />
            <p className="text-sm font-semibold text-[#3A423E]">No workers match this skill category.</p>
            <motion.button
              type="button"
              onClick={() => {
                setWorkerSearch('');
                setWorkerCategoryFilter('All');
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="text-xs text-[#14524C] font-bold underline"
            >
              View All Workers
            </motion.button>
          </motion.div>
        ) : (
          workers.map(wrk => (
            <motion.div
              key={wrk.id}
              variants={staggerItemFadeUp}
              whileHover={{ y: -4, scale: 1.01, boxShadow: '0 12px 30px -10px rgba(20, 82, 76, 0.12)' }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="p-6 rounded-3xl border border-[#D8D3C7] hover:border-[#14524C] bg-[#FFFFFF] flex flex-col justify-between space-y-5 group transition-colors shadow-sm"
            >
              <div className="space-y-4">
                {/* Avatar & Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#14524C] flex items-center justify-center font-extrabold text-[#FFFFFF] text-base group-hover:scale-105 transition-transform">
                      {wrk.full_name?.charAt(0) || 'W'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[#1B2420]">{wrk.full_name}</h3>
                        {wrk.verification_status === 'verified' && (
                          <ShieldCheck className="w-4 h-4 text-[#4A6741]" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#14524C]">
                        {wrk.trade_category} Specialist
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EEF1EE] border border-[#D8D3C7] text-[#1B2420] text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#D68C31] text-[#D68C31]" />
                    <span>{wrk.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-[#3A423E] line-clamp-2 leading-relaxed">
                  {wrk.bio || 'Cooperative-certified trade specialist with full background and skills audit.'}
                </p>

                {/* Badges Info */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D8D3C7] text-[11px] text-[#3A423E]">
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-[#4A6741]" />
                    <span>₹{wrk.hourly_rate}/hr rate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#14524C]" />
                    <span>{wrk.experience_years} yrs experience</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 truncate text-[#3A423E]">
                    <MapPin className="w-3.5 h-3.5 text-[#D68C31] shrink-0" />
                    <span className="truncate">
                      {wrk.service_areas?.join(', ') || 'Metropolitan Metro & Suburbs'}
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={() => onBookWorker(wrk)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-2xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Hire {wrk.full_name?.split(' ')[0]}</span>
              </motion.button>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};


export default CustomerWorkerGrid;
