import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, User, ArrowRight, ShieldCheck, Navigation, Sparkles } from 'lucide-react';
import BookingTrackingMap from '@/components/map/BookingTrackingMap';
import FusionMap, { DEFAULT_FALLBACK_POSITION } from '@/components/map/FusionMap';
import type { BookingItem, BookingStage } from '@/types/marketplace';
import type { GeoPosition } from '@/types/location';

interface CustomerTrackingViewProps {
  bookings: BookingItem[];
  activeTrackedBooking: BookingItem | undefined;
  trackedBookingId: string | null;
  setTrackedBookingId: (id: string) => void;
  customerUserId: string;
  onSimulateStage: (nextStage: BookingStage) => void;
  onOpenBookingModal: () => void;
}

// Default preview appointment when user has no active bookings
const DEFAULT_PREVIEW_BOOKING: BookingItem = {
  id: 'preview-dispatch-101',
  customer_id: 'guest-customer',
  customer_name: 'Member Customer',
  worker_id: 'worker-specialist-1',
  worker_name: 'Marcus Vance (Certified Electrician)',
  service_id: 'srv-preview-1',
  service_title: 'Electricity / Electrical Systems Diagnostic',
  service_category: 'Electricity',
  scheduled_date: new Date().toISOString().split('T')[0],
  scheduled_time: '02:00 PM',
  status: 'in_progress',
  stage: 'in_progress',
  total_price: 65.0,
  address: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051, India',
  latitude: DEFAULT_FALLBACK_POSITION.lat,
  longitude: DEFAULT_FALLBACK_POSITION.lng,
  created_at: new Date().toISOString(),
};

export const CustomerTrackingView: React.FC<CustomerTrackingViewProps> = ({
  bookings,
  activeTrackedBooking,
  trackedBookingId,
  setTrackedBookingId,
  customerUserId,
  onSimulateStage,
  onOpenBookingModal,
}) => {
  // Always select or fallback to an active booking object so map is NEVER empty
  const displayBooking: BookingItem =
    activeTrackedBooking || (bookings.length > 0 ? bookings[0] : DEFAULT_PREVIEW_BOOKING);

  const isPreviewMode = bookings.length === 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B2420] tracking-tight">
            Live 3D Service Tracker & GPS Dispatch
          </h1>
          <p className="text-xs text-[#3A423E]">
            High-resolution 3D satellite imagery tracking from artisan dispatch to escrow release.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPreviewMode && (
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#D68C31]/15 text-[#D68C31] border border-[#D68C31]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Network Live Preview</span>
            </span>
          )}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D8D3C7] text-xs font-bold text-[#14524C]">
            <span className="w-2 h-2 rounded-full bg-[#4A6741] animate-pulse" />
            <span>Order #{displayBooking.id.slice(-8)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Full-Width 3D Satellite Map & Stage Stepper */}
        <div className="w-full rounded-3xl overflow-hidden border border-[#D8D3C7] shadow-sm">
          <BookingTrackingMap
            booking={displayBooking}
            customerUserId={customerUserId || 'guest-customer'}
          />
        </div>

        {/* 2. Controls & Details Below Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Active Order Information */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-6 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#14524C] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EEF1EE] border border-[#D8D3C7]">
                  {displayBooking.service_category || 'Service Order'}
                </span>
                <span className="text-xs font-bold text-[#3A423E]">
                  Stage: <strong className="text-[#14524C] uppercase">{displayBooking.stage}</strong>
                </span>
              </div>

              <h2 className="text-base font-bold text-[#1B2420] leading-snug">
                {displayBooking.service_title}
              </h2>

              <div className="space-y-1.5 text-xs text-[#3A423E]">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#14524C] shrink-0" />
                  <span>Specialist: <strong className="text-[#1B2420]">{displayBooking.worker_name || 'Assigned Artisan'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#14524C] shrink-0" />
                  <span>{displayBooking.scheduled_date} at {displayBooking.scheduled_time}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D8D3C7] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#3A423E] uppercase font-bold block">Escrow Amount</span>
                <span className="text-xl font-extrabold text-[#14524C]">
                  ₹{displayBooking.total_price.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#4A6741] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                100% Protected
              </span>
            </div>
          </motion.div>

          {/* Card 2: Track Different Booking Selector */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-6 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1B2420]">Track Different Booking</h3>
              <p className="text-xs text-[#3A423E]">
                Select from your other active or upcoming service appointments.
              </p>
            </div>

            {bookings.length > 1 ? (
              <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                {bookings.map(b => {
                  const isSelected = (trackedBookingId || displayBooking.id) === b.id;
                  return (
                    <motion.button
                      key={b.id}
                      type="button"
                      onClick={() => setTrackedBookingId(b.id)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#14524C] text-[#FFFFFF] border-[#14524C] font-bold shadow-sm'
                          : 'bg-[#EEF1EE] text-[#1B2420] border-[#D8D3C7] hover:bg-[#FFFFFF] hover:border-[#14524C] font-medium'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate">{b.service_title}</p>
                        <span className={`text-[10px] ${isSelected ? 'text-[#FFFFFF]/70' : 'text-[#3A423E]'}`}>
                          {b.scheduled_date} • {b.scheduled_time}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]'
                            : 'bg-[#FFFFFF] text-[#14524C] border border-[#D8D3C7]'
                        }`}
                      >
                        {b.stage}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#3A423E] text-center space-y-2">
                <p className="font-semibold text-[#1B2420]">
                  {isPreviewMode ? 'No Appointments Booked Yet' : 'Single Active Appointment'}
                </p>
                <p className="text-[11px] leading-relaxed">
                  {isPreviewMode
                    ? 'Explore verified trade artisans and book an appointment to track their live arrival.'
                    : 'You currently have 1 appointment active. Book additional trades below.'}
                </p>
                <motion.button
                  type="button"
                  onClick={onOpenBookingModal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-bold text-xs transition-colors shadow-sm"
                >
                  <span>Book a New Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Card 3: Stage Advance / Simulation Controls */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-[#14524C] uppercase tracking-wider block">
                Simulate Live Stages
              </span>
              <h3 className="text-sm font-bold text-[#1B2420]">Cooperative Milestone Control</h3>
              <p className="text-xs text-[#3A423E]">
                Trigger progression updates along the 5-stage dispatch pipeline.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              {[
                {
                  stage: 'dispatched' as BookingStage,
                  label: '🚐 En Route / Dispatched',
                  color: 'bg-[#14524C]/10 text-[#14524C] border-[#14524C]/30 hover:bg-[#14524C]/20',
                },
                {
                  stage: 'in_progress' as BookingStage,
                  label: '⚡ Service In Progress',
                  color: 'bg-[#D68C31]/10 text-[#D68C31] border-[#D68C31]/30 hover:bg-[#D68C31]/20',
                },
                {
                  stage: 'completed' as BookingStage,
                  label: '✅ Mark Job Completed',
                  color: 'bg-[#4A6741]/10 text-[#4A6741] border-[#4A6741]/30 hover:bg-[#4A6741]/20',
                },
              ].map(btn => (
                <motion.button
                  key={btn.stage}
                  type="button"
                  onClick={() => onSimulateStage(btn.stage)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full px-4 py-3 rounded-2xl border text-xs font-bold transition-all shadow-none ${btn.color}`}
                >
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTrackingView;
