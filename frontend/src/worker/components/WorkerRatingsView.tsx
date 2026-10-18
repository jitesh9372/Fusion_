import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import type { ReviewItem } from '@/types/marketplace';

interface WorkerRatingsViewProps {
  reviews: ReviewItem[];
  averageRating: number;
}

export const WorkerRatingsView: React.FC<WorkerRatingsViewProps> = ({
  reviews,
  averageRating,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420]">Ratings & Verified Feedback</h1>
        <p className="text-xs text-[#3A423E]/80">
          Peer-reviewed customer ratings verified after escrow settlement.
        </p>
      </div>

      <div className="p-7 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D68C31]/15 text-[#D68C31] flex items-center justify-center font-black text-2xl">
            ★
          </div>
          <div>
            <span className="text-xs text-[#3A423E]/70 font-semibold block">Overall Performance Score</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-[#1B2420]">{averageRating.toFixed(1)}</span>
              <span className="text-xs font-bold text-[#D68C31]">/ 5.0 Rating</span>
            </div>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20">
          {reviews.length} Verified Reviews
        </span>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#D8D3C7] rounded-2xl bg-[#FFFFFF] text-[#3A423E]/70 text-xs shadow-sm">
            No customer reviews published yet.
          </div>
        ) : (
          reviews.map(r => (
            <div
              key={r.id}
              className="p-5 rounded-2xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1B2420]">{r.customer_name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4A6741]" />
                </div>
                <div className="flex items-center gap-1 text-[#D68C31] text-xs font-bold">
                  <span>★</span>
                  <span>{r.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-xs text-[#3A423E] italic">"{r.comment}"</p>
              <span className="text-[10px] text-[#3A423E]/60 block">{r.created_at?.slice(0, 10)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerRatingsView;
