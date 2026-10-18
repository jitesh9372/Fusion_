import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Sparkles,
  ShieldCheck,
  Calendar,
  User,
  CheckCircle2,
  Filter,
  MessageSquare,
  ArrowUpRight,
  Award,
} from 'lucide-react';
import type { ReviewItem, BookingItem, WorkerProfile } from '@/types/marketplace';

interface CustomerReviewsTabProps {
  reviews: ReviewItem[];
  bookings: BookingItem[];
  workers: WorkerProfile[];
  onOpenReviewModal: (booking: BookingItem) => void;
  onNavigateTab: (tabId: string) => void;
}

export const CustomerReviewsTab: React.FC<CustomerReviewsTabProps> = ({
  reviews,
  bookings,
  workers,
  onOpenReviewModal,
  onNavigateTab,
}) => {
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'rating'>('newest');

  // Find completed bookings that haven't been reviewed yet
  const reviewedBookingIds = useMemo(() => {
    return new Set(reviews.map(r => r.booking_id));
  }, [reviews]);

  const pendingReviewBookings = useMemo(() => {
    return bookings.filter(
      b => (b.status === 'completed' || b.stage === 'completed') && !reviewedBookingIds.has(b.id)
    );
  }, [bookings, reviewedBookingIds]);

  // Enrich reviews with worker details & service details if missing
  const enrichedReviews = useMemo(() => {
    return reviews.map(rev => {
      const matchedBooking = bookings.find(b => b.id === rev.booking_id);
      const matchedWorker = workers.find(
        w => w.id === rev.worker_id || (w.user_id && w.user_id === rev.worker_id)
      );

      return {
        ...rev,
        service_title: rev.service_title || matchedBooking?.service_title || 'Cooperative Skilled Service',
        worker_name: rev.worker_name || matchedWorker?.full_name || matchedBooking?.worker_name || 'Assigned Specialist',
        worker_trade: rev.worker_trade || matchedWorker?.trade_category || 'Craftsman',
        worker_avatar: rev.worker_avatar || matchedWorker?.avatar_url,
      };
    });
  }, [reviews, bookings, workers]);

  // Metrics
  const totalReviews = enrichedReviews.length;
  const averageRating =
    totalReviews > 0
      ? (enrichedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';
  const fiveStarCount = enrichedReviews.filter(r => r.rating === 5).length;
  const fiveStarPercent = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0;

  // Filtered & Sorted
  const filteredReviews = useMemo(() => {
    let list = [...enrichedReviews];

    if (selectedRatingFilter === '5') {
      list = list.filter(r => r.rating === 5);
    } else if (selectedRatingFilter === '4') {
      list = list.filter(r => r.rating === 4);
    } else if (selectedRatingFilter === '3below') {
      list = list.filter(r => r.rating <= 3);
    }

    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOrder === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [enrichedReviews, selectedRatingFilter, sortOrder]);

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* ─── Header & Description ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#1B2420]">
              Reviews & Artisan Feedback
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D68C31]/15 text-[#D68C31] border border-[#D68C31]/30">
              Cooperative Trust
            </span>
          </div>
          <p className="text-xs text-[#3A423E] mt-1 max-w-2xl leading-relaxed">
            Your verified ratings directly empower skilled artisans, building transparent reputation and sustaining fair cooperative wages across the network.
          </p>
        </div>

        {bookings.length > 0 && (
          <motion.button
            type="button"
            onClick={() => onNavigateTab('bookings')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#EEF1EE] border border-[#D8D3C7] text-xs font-bold text-[#14524C] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>View All Bookings</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {/* ─── Quick Summary Metrics ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Reviews */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#14524C]/10 text-[#14524C] flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#3A423E] font-medium block">Total Reviews</span>
            <span className="text-2xl font-extrabold text-[#1B2420]">{totalReviews}</span>
          </div>
        </div>

        {/* Metric 2: Average Rating */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D68C31]/15 text-[#D68C31] flex items-center justify-center font-bold">
            <Star className="w-6 h-6 fill-[#D68C31]" />
          </div>
          <div>
            <span className="text-xs text-[#3A423E] font-medium block">Average Rating Given</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-[#1B2420]">{averageRating}</span>
              <span className="text-xs text-[#3A423E]">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Metric 3: 5-Star Reviews */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4A6741]/15 text-[#4A6741] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#3A423E] font-medium block">5-Star Praise</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-[#1B2420]">{fiveStarCount}</span>
              <span className="text-xs text-[#4A6741] font-semibold">({fiveStarPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Awaiting Review */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#9C4A34]/10 text-[#9C4A34] flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#3A423E] font-medium block">Awaiting Your Review</span>
            <span className="text-2xl font-extrabold text-[#1B2420]">
              {pendingReviewBookings.length}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Actionable Banner for Unreviewed Completed Services ──────────── */}
      {pendingReviewBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-r from-[#14524C]/10 via-[#EEF1EE] to-[#D68C31]/10 border border-[#14524C]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#14524C] text-[#FFFFFF] flex items-center justify-center shrink-0 shadow-sm">
              <Star className="w-5 h-5 fill-[#FFFFFF]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1B2420]">
                You have {pendingReviewBookings.length} completed {pendingReviewBookings.length === 1 ? 'service' : 'services'} awaiting your feedback!
              </h4>
              <p className="text-xs text-[#3A423E]">
                Latest:{' '}
                <strong className="text-[#1B2420]">
                  {pendingReviewBookings[0].service_title}
                </strong>{' '}
                by{' '}
                <strong className="text-[#14524C]">
                  {pendingReviewBookings[0].worker_name || 'Assigned Artisan'}
                </strong>
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => onOpenReviewModal(pendingReviewBookings[0])}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] text-xs font-bold transition-colors shadow-sm shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D68C31]" />
            <span>Write Review Now</span>
          </motion.button>
        </motion.div>
      )}

      {/* ─── Filters & Sorting Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Star Rating Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All (${totalReviews})` },
            { id: '5', label: `5 Stars (${fiveStarCount})` },
            { id: '4', label: `4 Stars (${enrichedReviews.filter(r => r.rating === 4).length})` },
            { id: '3below', label: `3★ & Under (${enrichedReviews.filter(r => r.rating <= 3).length})` },
          ].map(f => {
            const isSelected = selectedRatingFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedRatingFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#14524C] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#3A423E] hover:text-[#1B2420] border border-[#D8D3C7]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Sort Order Selector */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#3A423E]" />
          <span className="text-[#3A423E] font-medium">Sort by:</span>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D8D3C7] text-xs font-semibold text-[#1B2420] focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* ─── Reviews Cards List ───────────────────────────────────────────── */}
      {filteredReviews.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center text-[#D68C31]">
            <Star className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1B2420]">No Reviews Found</h3>
            <p className="text-xs text-[#3A423E] max-w-sm mx-auto">
              {totalReviews === 0
                ? 'You have not submitted any reviews yet. Complete a service with a cooperative specialist to leave your verified feedback!'
                : 'No reviews match your selected filter criteria.'}
            </p>
          </div>
          {totalReviews === 0 && (
            <motion.button
              type="button"
              onClick={() => onNavigateTab('bookings')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <span>Explore My Bookings</span>
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map(rev => {
            const dateStr = new Date(rev.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <motion.div
                key={rev.id}
                whileHover={{ y: -2 }}
                className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] hover:border-[#14524C] transition-all shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Worker & Service Reference Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#14524C] text-[#FFFFFF] font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-xs">
                        {rev.worker_avatar ? (
                          <img
                            src={rev.worker_avatar}
                            alt={rev.worker_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          rev.worker_name?.slice(0, 2).toUpperCase() || 'SP'
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#1B2420] truncate">
                          {rev.worker_name}
                        </h4>
                        <p className="text-[11px] text-[#14524C] font-semibold truncate">
                          {rev.worker_trade}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1 bg-[#EEF1EE] px-2.5 py-1 rounded-xl border border-[#D8D3C7] shrink-0">
                      <Star className="w-4 h-4 fill-[#D68C31] text-[#D68C31]" />
                      <span className="text-xs font-extrabold text-[#1B2420]">
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Service Title */}
                  <div className="p-2.5 rounded-xl bg-[#EEF1EE]/70 border border-[#D8D3C7]/60">
                    <span className="text-[10px] text-[#3A423E] block font-medium">Service Provided</span>
                    <p className="text-xs font-bold text-[#1B2420] truncate">
                      {rev.service_title}
                    </p>
                  </div>

                  {/* Comment Feedback */}
                  <p className="text-xs text-[#3A423E] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Footer Badges & Date */}
                <div className="pt-3 border-t border-[#D8D3C7]/60 flex items-center justify-between text-[11px] text-[#3A423E]">
                  <div className="flex items-center gap-1.5 text-[#14524C] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Booking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerReviewsTab;
