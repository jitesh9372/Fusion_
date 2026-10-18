import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItemFadeUp } from '@/animations/motionConfig';
import { Search, Clock, ArrowRight, Wrench } from 'lucide-react';
import type { ServiceItem } from '@/types/marketplace';

interface CustomerServiceGridProps {
  services: ServiceItem[];
  serviceSearch: string;
  setServiceSearch: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  renderServiceIcon: (category: string) => React.ReactNode;
  onBookService: (service: ServiceItem) => void;
}

export const CustomerServiceGrid: React.FC<CustomerServiceGridProps> = ({
  services,
  serviceSearch,
  setServiceSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  renderServiceIcon,
  onBookService,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B2420] tracking-tight">
            Cooperative Trade Services Catalog
          </h1>
          <p className="text-xs text-[#3A423E]">
            Transparent pricing with 0% predatory platform markups.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14524C]" />
          <input
            type="text"
            placeholder="Search service title, trade..."
            value={serviceSearch}
            onChange={e => setServiceSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FFFFFF] border border-[#D8D3C7] focus:border-[#14524C] rounded-2xl text-[#1B2420] placeholder-[#3A423E]/60 focus:outline-none transition-all shadow-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-1">
        {categories.map(cat => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <motion.button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
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

      {/* Services Grid with Staggered Entrance */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {services.length === 0 ? (
          <motion.div
            variants={staggerItemFadeUp}
            className="col-span-full p-12 text-center border border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-2"
          >
            <Wrench className="w-8 h-8 text-[#3A423E]/50 mx-auto" />
            <p className="text-sm font-semibold text-[#3A423E]">No services match your filters.</p>
            <motion.button
              type="button"
              onClick={() => {
                setServiceSearch('');
                setSelectedCategory('All');
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="text-xs text-[#14524C] font-bold underline"
            >
              Reset Filters
            </motion.button>
          </motion.div>
        ) : (
          services.map(srv => (
            <motion.div
              key={srv.id}
              variants={staggerItemFadeUp}
              whileHover={{ y: -4, scale: 1.01, boxShadow: '0 12px 30px -10px rgba(20, 82, 76, 0.12)' }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="p-6 rounded-3xl border border-[#D8D3C7] hover:border-[#14524C] bg-[#FFFFFF] flex flex-col justify-between space-y-5 group transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center text-[#14524C] group-hover:scale-110 group-hover:bg-[#14524C] group-hover:text-white transition-all duration-200">
                    {renderServiceIcon(srv.category)}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EEF1EE] text-[#14524C] border border-[#D8D3C7] group-hover:border-[#14524C]/40 transition-colors">
                    {srv.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#1B2420] group-hover:text-[#14524C] transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-[#3A423E] line-clamp-2 mt-1 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D8D3C7] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#3A423E] block uppercase font-bold tracking-wider">
                    Base Price
                  </span>
                  <span className="text-xl font-extrabold text-[#1B2420]">
                    ₹{srv.base_price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-[#3A423E] flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#14524C]" />
                    {srv.duration_mins}m
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => onBookService(srv)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-2.5 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm group/btn"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};


export default CustomerServiceGrid;
