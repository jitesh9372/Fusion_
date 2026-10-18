import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, User, MapPin, Calendar, Check, X } from 'lucide-react';
import type { BookingItem } from '@/types/marketplace';

interface WorkerJobRequestsListProps {
  matchedJobRequests: BookingItem[];
  selectedTrade: string;
  setSelectedTrade: (trade: string) => void;
  onAcceptJob: (booking: BookingItem) => void;
  onDeclineJob: (bookingId: string) => void;
}

export const WorkerJobRequestsList: React.FC<WorkerJobRequestsListProps> = ({
  matchedJobRequests,
  selectedTrade,
  setSelectedTrade,
  onAcceptJob,
  onDeclineJob,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420]">Incoming Job Dispatches</h1>
          <p className="text-xs text-[#3A423E]/80">
            Real-time appointment requests matching your trade skill with 90% guaranteed net payout.
          </p>
        </div>

        {/* Trade View Switcher */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-2 rounded-2xl border border-[#D8D3C7] shadow-sm">
          <span className="text-xs text-[#3A423E]/70 font-medium">Filter Trade:</span>
          <select
            value={selectedTrade}
            onChange={e => setSelectedTrade(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
          >
            <option value="Electricity">⚡ Electricity</option>
            <option value="AC Repair">❄️ AC Repair</option>
            <option value="Plumbing">🔧 Plumbing</option>
            <option value="Painting">🎨 Painting</option>
            <option value="Cleaning">🧹 Cleaning</option>
            <option value="Carpentry">🪚 Carpentry</option>
            <option value="Gardening">🌳 Gardening</option>
            <option value="Driving">🚗 Driving</option>
            <option value="Appliance Repair">🏠 Appliance</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {matchedJobRequests.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-2 shadow-sm">
            <Briefcase className="w-10 h-10 text-[#3A423E]/30 mx-auto" />
            <p className="text-sm font-semibold text-[#1B2420]">
              No pending requests for {selectedTrade} right now.
            </p>
            <p className="text-xs text-[#3A423E]/70">
              Keep your status ONLINE to receive incoming dispatches.
            </p>
          </div>
        ) : (
          matchedJobRequests.map(b => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-7 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-all shadow-sm"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#4A6741]/10 border border-[#4A6741]/20 text-[#4A6741] font-bold">
                    Matched: {b.service_category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#1B2420]">{b.service_title}</h3>
                  <span className="text-[10px] font-mono text-[#3A423E]/60 bg-[#EEF1EE] px-2 py-0.5 rounded-md">#{b.id.slice(-6)}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-[#3A423E]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#4A6741]" />
                    Customer: <strong className="text-[#1B2420]">{b.customer_name}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D68C31]" />
                    {b.address}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#14524C]" />
                    {b.scheduled_date} at {b.scheduled_time}
                  </span>
                </div>

                {b.notes && (
                  <div className="text-xs text-[#3A423E] italic bg-[#EEF1EE] p-3 rounded-2xl border border-[#D8D3C7]/60">
                    Customer Issue: "{b.notes}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-[#3A423E]/70 block uppercase font-bold tracking-wider">
                    Net Payout (90%)
                  </span>
                  <span className="text-xl font-black text-[#4A6741]">
                    ₹{(Number(b.total_price || 0) * 0.9).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAcceptJob(b)}
                    className="px-5 py-2.5 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs transition-all shadow-sm hover:shadow"
                  >
                    Accept Job
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeclineJob(b.id)}
                    className="px-4 py-2.5 rounded-2xl bg-[#EEF1EE] hover:bg-red-50 text-[#3A423E] hover:text-red-600 border border-[#D8D3C7] text-xs font-semibold transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerJobRequestsList;
