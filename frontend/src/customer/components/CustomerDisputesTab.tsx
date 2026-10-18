import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ShieldAlert,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Film,
  Image as ImageIcon,
  X,
  ChevronRight,
  PlusCircle,
  Scale,
} from 'lucide-react';
import type { DisputeItem, BookingItem } from '@/types/marketplace';

interface CustomerDisputesTabProps {
  disputes: DisputeItem[];
  bookings: BookingItem[];
  onOpenDisputeModal: (booking: BookingItem) => void;
  onNavigateTab: (tabId: string) => void;
}

export const CustomerDisputesTab: React.FC<CustomerDisputesTabProps> = ({
  disputes,
  bookings,
  onOpenDisputeModal,
  onNavigateTab,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeMediaModal, setActiveMediaModal] = useState<{ url: string; isVideo: boolean } | null>(null);
  const [bookingSelectorOpen, setBookingSelectorOpen] = useState(false);

  // Enrich disputes with booking information
  const enrichedDisputes = useMemo(() => {
    return disputes.map(dsp => {
      const b = bookings.find(item => item.id === dsp.booking_id);
      return {
        ...dsp,
        service_title: dsp.service_title || b?.service_title || 'Cooperative Booking Service',
        worker_name: dsp.worker_name || b?.worker_name || 'Assigned Specialist',
        booking_amount: dsp.booking_amount || b?.total_price || 0,
        booking_date: dsp.booking_date || b?.scheduled_date || '',
      };
    });
  }, [disputes, bookings]);

  // Summary Metrics
  const totalDisputes = enrichedDisputes.length;
  const openCount = enrichedDisputes.filter(d => d.status === 'open' || d.status === 'under_review').length;
  const resolvedCount = enrichedDisputes.filter(d => d.status === 'resolved').length;
  const totalFrozenEscrow = enrichedDisputes
    .filter(d => d.status === 'open' || d.status === 'under_review')
    .reduce((sum, d) => sum + (d.booking_amount || 0), 0);

  // Filtered List
  const filteredDisputes = useMemo(() => {
    if (selectedStatusFilter === 'all') return enrichedDisputes;
    return enrichedDisputes.filter(d => d.status === selectedStatusFilter);
  }, [enrichedDisputes, selectedStatusFilter]);

  const handleStartDispute = () => {
    if (bookings.length === 0) {
      onNavigateTab('services');
      return;
    }
    if (bookings.length === 1) {
      onOpenDisputeModal(bookings[0]);
    } else {
      setBookingSelectorOpen(true);
    }
  };

  const isVideoUrl = (url: string) => {
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'mov', 'ogg'].includes(ext);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* ─── Header & Description ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#1B2420]">
              Disputes & Escrow Arbitration
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9C4A34]/15 text-[#9C4A34] border border-[#9C4A34]/30">
              Escrow Protection
            </span>
          </div>
          <p className="text-xs text-[#3A423E] mt-1 max-w-2xl leading-relaxed">
            Cooperative governance safeguards your funds. When an issue occurs, escrow payments are held securely while cooperative arbitrators review photo and video evidence.
          </p>
        </div>

        {bookings.length > 0 && (
          <motion.button
            type="button"
            onClick={handleStartDispute}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#9C4A34] hover:bg-[#853C28] text-[#FFFFFF] text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise New Dispute</span>
          </motion.button>
        )}
      </div>

      {/* ─── Summary Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Disputes */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF1EE] text-[#1B2420] flex items-center justify-center font-bold">
            <Scale className="w-6 h-6 text-[#14524C]" />
          </div>
          <div>
            <span className="text-xs text-[#3A423E] font-medium block">Total Claims</span>
            <span className="text-2xl font-extrabold text-[#1B2420]">{totalDisputes}</span>
          </div>
        </div>

        {/* Metric 2: Open / In Arbitration */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D68C31]/15 text-[#D68C31] flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#3A423E] font-medium block">Under Arbitration</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-[#D68C31]">{openCount}</span>
              <span className="text-xs text-[#3A423E]">Active</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Successfully Resolved */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4A6741]/15 text-[#4A6741] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#3A423E] font-medium block">Resolved by Board</span>
            <span className="text-2xl font-extrabold text-[#4A6741]">{resolvedCount}</span>
          </div>
        </div>

        {/* Metric 4: Frozen Escrow */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#9C4A34]/15 text-[#9C4A34] flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#3A423E] font-medium block">Frozen in Escrow</span>
            <span className="text-2xl font-extrabold text-[#9C4A34]">
              ₹{totalFrozenEscrow.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Status Filter Tabs ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {[
          { id: 'all', label: `All Claims (${totalDisputes})` },
          { id: 'open', label: `Open (${enrichedDisputes.filter(d => d.status === 'open').length})` },
          { id: 'under_review', label: `Under Review (${enrichedDisputes.filter(d => d.status === 'under_review').length})` },
          { id: 'resolved', label: `Resolved (${resolvedCount})` },
          { id: 'dismissed', label: `Dismissed (${enrichedDisputes.filter(d => d.status === 'dismissed').length})` },
        ].map(tab => {
          const isSelected = selectedStatusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#14524C] text-[#FFFFFF] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#3A423E] hover:text-[#1B2420] border border-[#D8D3C7]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Disputes List ───────────────────────────────────────────────── */}
      {filteredDisputes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center text-[#4A6741]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1B2420]">
              {totalDisputes === 0 ? 'No Active Disputes' : 'No Claims in Selected Filter'}
            </h3>
            <p className="text-xs text-[#3A423E] max-w-sm mx-auto">
              {totalDisputes === 0
                ? 'Your bookings are running smoothly under cooperative standards. If an issue arises with an artisan, you can lodge a claim here anytime.'
                : 'Try choosing another status filter above to inspect historical claims.'}
            </p>
          </div>
          {bookings.length > 0 && totalDisputes === 0 && (
            <motion.button
              type="button"
              onClick={handleStartDispute}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-xl bg-[#EEF1EE] hover:bg-[#D8D3C7] text-[#1B2420] text-xs font-bold transition-colors inline-flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-[#9C4A34]" />
              <span>Raise a Dispute on an Order</span>
            </motion.button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredDisputes.map(dsp => {
            const dateStr = new Date(dsp.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            // Status style config
            const statusConfig = {
              open: {
                label: 'Open / Lodged',
                badgeBg: 'bg-[#D68C31]/15 text-[#D68C31] border-[#D68C31]/40',
                step: 1,
              },
              under_review: {
                label: 'Under Review',
                badgeBg: 'bg-[#14524C]/15 text-[#14524C] border-[#14524C]/40',
                step: 2,
              },
              resolved: {
                label: 'Arbitration Resolved',
                badgeBg: 'bg-[#4A6741]/15 text-[#4A6741] border-[#4A6741]/40',
                step: 3,
              },
              dismissed: {
                label: 'Claim Dismissed',
                badgeBg: 'bg-[#3A423E]/15 text-[#3A423E] border-[#3A423E]/40',
                step: 3,
              },
            }[dsp.status] || {
              label: dsp.status,
              badgeBg: 'bg-[#EEF1EE] text-[#1B2420] border-[#D8D3C7]',
              step: 1,
            };

            const evidenceList = dsp.evidence_urls || [];

            return (
              <motion.div
                key={dsp.id}
                whileHover={{ y: -1 }}
                className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] hover:border-[#14524C] transition-all shadow-xs space-y-5"
              >
                {/* Card Top: Order info & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D3C7]/60 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A423E]">
                        Claim #{dsp.id.slice(0, 8)}
                      </span>
                      <span>•</span>
                      <span className="text-xs text-[#3A423E] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#1B2420]">
                      {dsp.service_title}
                    </h3>
                    <div className="text-xs text-[#3A423E] flex flex-wrap gap-2">
                      <span>Artisan: <strong className="text-[#1B2420]">{dsp.worker_name}</strong></span>
                      <span>•</span>
                      <span>Order #{dsp.booking_id.slice(0, 8)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-[#3A423E] font-medium block">
                        Locked Escrow
                      </span>
                      <span className="text-base font-extrabold text-[#9C4A34]">
                        ₹{Number(dsp.booking_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusConfig.badgeBg}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Reason & Description */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#9C4A34]">
                        Claim Reason
                      </span>
                      <p className="text-xs font-bold text-[#1B2420]">
                        {dsp.reason}
                      </p>
                    </div>

                    {dsp.description && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#3A423E]">
                          Client Statement & Particulars
                        </span>
                        <p className="text-xs text-[#3A423E] leading-relaxed bg-[#FFFFFF] p-3 rounded-2xl border border-[#D8D3C7]/60">
                          {dsp.description}
                        </p>
                      </div>
                    )}

                    {/* Evidence Gallery (Images & Videos) */}
                    {evidenceList.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-[#1B2420] flex items-center gap-1.5">
                            <Film className="w-3.5 h-3.5 text-[#14524C]" />
                            <span>Submitted Evidence ({evidenceList.length} files)</span>
                          </span>
                          <span className="text-[11px] text-[#3A423E]">
                            Click thumbnail to inspect media
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          {evidenceList.map((url, idx) => {
                            const isVid = isVideoUrl(url);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveMediaModal({ url, isVideo: isVid })}
                                className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#D8D3C7] hover:border-[#14524C] group focus:outline-none transition-all"
                              >
                                {isVid ? (
                                  <div className="w-full h-full bg-[#1B2420] flex flex-col items-center justify-center text-[#FFFFFF] p-1">
                                    <Film className="w-6 h-6 text-[#D68C31]" />
                                    <span className="text-[8px] font-bold bg-[#000000]/60 px-1 rounded mt-0.5">
                                      PLAY
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`Evidence #${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                )}
                                <div className="absolute inset-0 bg-[#1B2420]/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#FFFFFF] transition-opacity">
                                  <ExternalLink className="w-4 h-4" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arbitration Status Box */}
                  <div className="p-4 rounded-2xl bg-[#EEF1EE]/70 border border-[#D8D3C7] space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#14524C]" />
                        <h4 className="text-xs font-bold text-[#1B2420]">
                          Cooperative Arbitration Tracker
                        </h4>
                      </div>

                      {/* Stepper */}
                      <div className="space-y-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-[#4A6741] text-[#FFFFFF] flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </div>
                          <span className="font-semibold text-[#1B2420]">Claim Lodged</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-[#4A6741] text-[#FFFFFF] flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </div>
                          <span className="font-semibold text-[#1B2420]">Escrow Frozen (₹{dsp.booking_amount?.toFixed(2)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              statusConfig.step >= 2
                                ? 'bg-[#14524C] text-[#FFFFFF]'
                                : 'bg-[#D8D3C7] text-[#3A423E]'
                            }`}
                          >
                            {statusConfig.step >= 2 ? '•' : '3'}
                          </div>
                          <span
                            className={
                              statusConfig.step >= 2
                                ? 'font-bold text-[#14524C]'
                                : 'text-[#3A423E]'
                            }
                          >
                            Evidence Hearing
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              statusConfig.step >= 3
                                ? 'bg-[#4A6741] text-[#FFFFFF]'
                                : 'bg-[#D8D3C7] text-[#3A423E]'
                            }`}
                          >
                            {statusConfig.step >= 3 ? '✓' : '4'}
                          </div>
                          <span
                            className={
                              statusConfig.step >= 3
                                ? 'font-bold text-[#4A6741]'
                                : 'text-[#3A423E]'
                            }
                          >
                            Binding Board Resolution
                          </span>
                        </div>
                      </div>

                      {/* Resolution Notes */}
                      {dsp.resolution_notes && (
                        <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-1 mt-2">
                          <span className="text-[10px] uppercase font-bold text-[#14524C]">
                            Arbitrator Notes
                          </span>
                          <p className="text-[11px] text-[#3A423E] leading-relaxed">
                            {dsp.resolution_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#D8D3C7]/60 text-[10px] text-[#3A423E] flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#9C4A34]" />
                      <span>Protected under FUSION escrow charter</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Media Lightbox Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {activeMediaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2420]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-3xl w-full max-h-[85vh] bg-[#FFFFFF] rounded-3xl overflow-hidden border border-[#D8D3C7] p-2 flex flex-col items-center justify-center"
            >
              <button
                type="button"
                onClick={() => setActiveMediaModal(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#1B2420]/70 text-[#FFFFFF] hover:bg-[#1B2420] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {activeMediaModal.isVideo ? (
                <video
                  controls
                  autoPlay
                  src={activeMediaModal.url}
                  className="w-full max-h-[75vh] rounded-2xl bg-[#000000]"
                />
              ) : (
                <img
                  src={activeMediaModal.url}
                  alt="Dispute evidence preview"
                  className="w-full max-h-[75vh] object-contain rounded-2xl"
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Booking Selector Dialog (When Raising Dispute with Multiple Bookings) ─ */}
      <AnimatePresence>
        {bookingSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2420]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#1B2420]">
                    Select Service Booking to Dispute
                  </h3>
                  <p className="text-xs text-[#3A423E]">
                    Choose the specific job you wish to lodge a claim for.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingSelectorOpen(false)}
                  className="p-1.5 rounded-xl text-[#3A423E] hover:text-[#1B2420] hover:bg-[#EEF1EE]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {bookings.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBookingSelectorOpen(false);
                      onOpenDisputeModal(b);
                    }}
                    className="w-full p-4 rounded-2xl bg-[#EEF1EE] hover:bg-[#14524C]/10 border border-[#D8D3C7] hover:border-[#14524C] text-left transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1B2420] truncate group-hover:text-[#14524C]">
                        {b.service_title}
                      </h4>
                      <p className="text-[11px] text-[#3A423E]">
                        Specialist: {b.worker_name || 'Assigned'} • 📅 {b.scheduled_date}
                      </p>
                      <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#14524C] border border-[#D8D3C7]">
                        {b.status}
                      </span>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <span className="text-[10px] text-[#3A423E] block">Total</span>
                        <span className="text-xs font-extrabold text-[#1B2420]">
                          ₹{Number(b.total_price || 0).toFixed(2)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#3A423E] group-hover:text-[#14524C]" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDisputesTab;
