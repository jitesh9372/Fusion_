import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import type { BookingItem } from '@/types/marketplace';

interface CustomerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingItem | null;
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  submitting?: boolean;
}

const RATING_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: 'Poor', desc: 'Significant issues with craftsmanship or timeliness.' },
  2: { label: 'Fair', desc: 'Service completed below expectations.' },
  3: { label: 'Good', desc: 'Acceptable quality, standard cooperative service.' },
  4: { label: 'Very Good', desc: 'Punctual, thorough, and highly competent.' },
  5: { label: 'Exceptional', desc: 'Masterful craftsmanship and outstanding service!' },
};

export const CustomerReviewModal: React.FC<CustomerReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  submitting = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  if (!isOpen || !booking) return null;

  const currentActiveRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = RATING_LABELS[currentActiveRating] || RATING_LABELS[5];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2420]/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xl space-y-5 my-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D68C31]/15 text-[#D68C31]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-[#1B2420]">Rate & Review Service</h3>
              </div>
              <p className="text-xs text-[#3A423E]">
                Your feedback empowers artisans and maintains quality cooperative standards.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#3A423E] hover:text-[#1B2420] hover:bg-[#EEF1EE] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Booking / Worker Details Card */}
          <div className="p-4 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#14524C] text-[#FFFFFF] font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                {booking.worker_name
                  ? booking.worker_name.slice(0, 2).toUpperCase()
                  : 'SP'}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#1B2420] truncate">
                  {booking.service_title}
                </h4>
                <p className="text-xs text-[#14524C] font-semibold truncate">
                  Artisan: {booking.worker_name || 'Assigned Specialist'}
                </p>
                <div className="text-[11px] text-[#3A423E] flex items-center gap-2 mt-0.5">
                  <span>📅 {booking.scheduled_date}</span>
                  <span>•</span>
                  <span>Order #{booking.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-[#3A423E] font-medium block">Total Paid</span>
              <span className="text-sm font-extrabold text-[#1B2420]">
                ₹{Number(booking.total_price || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 text-xs">
            {/* Interactive Star Rating */}
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-2 text-center">
              <label className="text-xs text-[#1B2420] font-bold block">
                Craftsmanship & Professionalism Rating
              </label>
              <div className="flex items-center justify-center gap-2 pt-1 pb-1">
                {[1, 2, 3, 4, 5].map(star => {
                  const isFilled = star <= currentActiveRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1.5 rounded-xl hover:scale-115 transition-all focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          isFilled
                            ? 'fill-[#D68C31] text-[#D68C31] drop-shadow-sm'
                            : 'text-[#D8D3C7] hover:text-[#D68C31]/50'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="min-h-[32px] flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-[#1B2420]">
                  {ratingInfo.label} ({currentActiveRating}/5)
                </span>
                <span className="text-[11px] text-[#3A423E]">{ratingInfo.desc}</span>
              </div>
            </div>

            {/* Written Comment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#1B2420] font-bold">
                  Your Detailed Review
                </label>
                <span className="text-[11px] text-[#3A423E]">
                  {comment.length} characters (min 10)
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your honest experience: Did the specialist arrive on time? Was the workspace left tidy? How was their communication and quality of work?"
                className="w-full px-3.5 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] focus:border-[#14524C] focus:bg-[#FFFFFF] rounded-2xl text-[#1B2420] placeholder-[#3A423E]/60 focus:outline-none resize-none transition-colors text-xs leading-relaxed"
              />
            </div>

            {/* Cooperative Trust Assurance */}
            <div className="flex items-center gap-2 text-[11px] text-[#3A423E] bg-[#EEF1EE]/60 p-2.5 rounded-xl border border-[#D8D3C7]/60">
              <ShieldCheck className="w-4 h-4 text-[#14524C] shrink-0" />
              <span>
                Verified Review: Authenticated with your completed booking order on the FUSION network.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D8D3C7]/60">
              <motion.button
                type="button"
                onClick={onClose}
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-[#3A423E] hover:text-[#1B2420] font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={submitting || comment.trim().length < 10}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Review</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerReviewModal;
