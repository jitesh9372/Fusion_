import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, Plus, CheckCircle, Clock } from 'lucide-react';
import type { WelfareClaim } from '@/types/marketplace';

interface WorkerWelfareTrainingViewProps {
  welfareClaims: WelfareClaim[];
  welfareModalOpen: boolean;
  setWelfareModalOpen: (open: boolean) => void;
  welfareClaimType: string;
  setWelfareClaimType: (type: string) => void;
  welfareAmount: string;
  setWelfareAmount: (amount: string) => void;
  welfareDesc: string;
  setWelfareDesc: (desc: string) => void;
  onSubmitWelfareClaim: (e: React.FormEvent) => void;
}

export const WorkerWelfareTrainingView: React.FC<WorkerWelfareTrainingViewProps> = ({
  welfareClaims,
  welfareModalOpen,
  setWelfareModalOpen,
  welfareClaimType,
  setWelfareClaimType,
  welfareAmount,
  setWelfareAmount,
  welfareDesc,
  setWelfareDesc,
  onSubmitWelfareClaim,
}) => {
  return (
    <div className="space-y-8">
      {/* Welfare Claims Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420]">Mutual Welfare Fund</h1>
            <p className="text-xs text-[#3A423E]/80">
              Cooperative emergency assistance, medical insurance support, and equipment upgrade grants.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setWelfareModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Welfare Claim</span>
          </button>
        </div>

        {/* Existing Claims Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {welfareClaims.length === 0 ? (
            <div className="col-span-full p-8 text-center border border-dashed border-[#D8D3C7] rounded-2xl bg-[#FFFFFF] text-[#3A423E]/70 text-xs shadow-sm">
              No active welfare claims filed.
            </div>
          ) : (
            welfareClaims.map(c => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B2420]">{c.claim_type}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'approved'
                        ? 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20'
                        : 'bg-[#D68C31]/15 text-[#9A621C] border border-[#D68C31]/30'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-[#3A423E]">{c.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-[#D8D3C7]/60 text-xs">
                  <span className="text-[#3A423E]/60">{c.created_at?.slice(0, 10)}</span>
                  <span className="font-extrabold text-[#4A6741]">
                    ₹{(c.amount ?? c.amount_requested ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      {/* Claim Submission Modal */}
      <AnimatePresence>
        {welfareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-2xl space-y-5"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1B2420]">Apply for Mutual Welfare Subsidy</h3>
                <p className="text-xs text-[#3A423E]/80">
                  Reviewed by the cooperative peer committee within 24 hours.
                </p>
              </div>

              <form onSubmit={onSubmitWelfareClaim} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-semibold">Claim Purpose</label>
                  <select
                    value={welfareClaimType}
                    onChange={e => setWelfareClaimType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  >
                    <option value="Equipment Upgrade Subsidy">Equipment Upgrade Subsidy</option>
                    <option value="Medical Emergency Assistance">Medical Emergency Assistance</option>
                    <option value="Family Support Grant">Family Support Grant</option>
                    <option value="Transportation / Fuel Relief">Transportation / Fuel Relief</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-semibold">Requested Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={welfareAmount}
                    onChange={e => setWelfareAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] font-bold focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-semibold">Justification & Receipts Note</label>
                  <textarea
                    required
                    rows={3}
                    value={welfareDesc}
                    onChange={e => setWelfareDesc(e.target.value)}
                    placeholder="Provide details on equipment model, medical invoice, or emergency circumstances..."
                    className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741] resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setWelfareModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[#3A423E] hover:text-[#1B2420] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold shadow-sm transition-all"
                  >
                    Submit Claim
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkerWelfareTrainingView;
