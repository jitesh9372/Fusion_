/**
 * BookingTrackingMap — Customer Real-Time 3D Satellite Booking Status + Location
 *
 * Grounded in FUSION artisan palette:
 * Canvas #FFFFFF / #EEF1EE, Ink #1B2420, Primary #14524C, Accent #D68C31, Success #4A6741, Hairline Border #D8D3C7.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Activity,
  CheckCircle,
  Loader2,
  User,
  Calendar,
  Navigation2,
  ExternalLink,
  RefreshCw,
  Navigation,
} from 'lucide-react';
import FusionMap, { DEFAULT_FALLBACK_POSITION } from './FusionMap';
import { searchAddress } from '@/services/geocodingService';
import { supabase } from '@/lib/supabase';
import type { GeoPosition } from '@/types/location';
import type { BookingItem, BookingStage } from '@/types/marketplace';

interface BookingTrackingMapProps {
  booking: BookingItem;
  /** Customer user ID for security */
  customerUserId: string;
}

const STAGES: { key: BookingStage; label: string; icon: React.FC<any> }[] = [
  { key: 'requested', label: 'Requested', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'dispatched', label: 'Dispatched', icon: Truck },
  { key: 'in_progress', label: 'In Progress', icon: Activity },
  { key: 'completed', label: 'Done', icon: CheckCircle },
];

const STAGE_INDEX: Record<string, number> = {
  requested: 0,
  confirmed: 1,
  dispatched: 2,
  in_progress: 3,
  completed: 4,
};

const BookingTrackingMap: React.FC<BookingTrackingMapProps> = ({
  booking: initialBooking,
  customerUserId,
}) => {
  const [booking, setBooking] = useState<BookingItem>(initialBooking);
  const [position, setPosition] = useState<GeoPosition>(DEFAULT_FALLBACK_POSITION);
  const [loadingMap, setLoadingMap] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const currentStageIndex = STAGE_INDEX[booking.stage] ?? 0;
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  // ─── Geocode booking address with guaranteed fallback ────────────────────────
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoadingMap(true);
      try {
        if ((booking as any).latitude && (booking as any).longitude) {
          if (isMounted) {
            setPosition({
              lat: (booking as any).latitude,
              lng: (booking as any).longitude,
            });
          }
        } else if (booking.address && booking.address.trim().length > 3) {
          const results = await searchAddress(booking.address);
          if (isMounted) {
            if (results && results.length > 0) {
              setPosition(results[0].position);
            } else {
              // Fallback to default position so map is ALWAYS visible
              setPosition(DEFAULT_FALLBACK_POSITION);
            }
          }
        } else {
          if (isMounted) setPosition(DEFAULT_FALLBACK_POSITION);
        }
      } catch {
        if (isMounted) setPosition(DEFAULT_FALLBACK_POSITION);
      } finally {
        if (isMounted) setLoadingMap(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [booking.address]);

  // ─── Supabase Realtime subscription ────────────────────────────────────────
  useEffect(() => {
    if (!booking.id || !customerUserId) return;

    const channel = supabase
      .channel(`tracking-booking-${booking.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${booking.id}`,
        },
        (payload) => {
          const updated = payload.new as BookingItem;
          if (updated.customer_id === customerUserId) {
            setBooking(updated);
            setLastUpdated(new Date());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking.id, customerUserId]);

  const getDirectionsUrl = () => {
    if (position) {
      return `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] overflow-hidden text-[#1B2420]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8D3C7]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center text-[#14524C]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1B2420]">3D Live Service Tracking</h3>
            <p className="text-xs text-[#3A423E]">{booking.service_title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#14524C] px-2.5 py-1 rounded-full bg-[#EEF1EE] border border-[#D8D3C7]">
            {booking.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#4A6741] animate-pulse" />
        </div>
      </div>

      {/* Stage Stepper */}
      <div className="px-5 py-4 border-b border-[#D8D3C7] bg-[#F4F6F4]/50">
        <div className="relative flex items-center justify-between">
          {/* Progress line */}
          <div className="absolute left-0 right-0 top-3.5 h-0.5 bg-[#D8D3C7]" />
          <div
            className="absolute left-0 top-3.5 h-0.5 bg-[#14524C] transition-all duration-700"
            style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
          />

          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={stage.key} className="relative flex flex-col items-center gap-1.5 z-10">
                <motion.div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isDone
                      ? 'bg-[#14524C] border-[#14524C] text-[#FFFFFF]'
                      : isCurrent
                      ? 'bg-[#FFFFFF] border-[#14524C] text-[#14524C] shadow-sm'
                      : 'bg-[#EEF1EE] border-[#D8D3C7] text-[#3A423E]/50'
                  }`}
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </motion.div>
                <span
                  className={`text-[10px] font-bold text-center ${
                    isDone || isCurrent ? 'text-[#14524C]' : 'text-[#3A423E]/60'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3D Satellite Map Container */}
      <div className="relative w-full">
        {loadingMap ? (
          <div className="flex items-center justify-center h-[490px] bg-[#1B2420]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-[#14524C] animate-spin" />
              <span className="text-xs text-white/70 font-medium">Loading 3D Satellite Imagery…</span>
            </div>
          </div>
        ) : (
          <FusionMap
            position={position}
            zoom={16}
            height={490}
            showMarker={true}
            draggable={false}
            markerType="customer"
            defaultLayer="3d-satellite"
            showLayerToggle={true}
            showGpsButton={true}
            onLocationFound={(gpsPos) => {
              setPosition(gpsPos);
            }}
            className="rounded-none border-0 w-full"
          />
        )}
      </div>

      {/* Address + Info Strip */}
      <div className="px-5 py-4 space-y-3.5 border-t border-[#D8D3C7] bg-[#FFFFFF]">
        {/* Address */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center text-[#14524C] shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[#3A423E] uppercase tracking-wider font-extrabold mb-0.5">
              Service Destination Address
            </p>
            <p className="text-sm font-bold text-[#1B2420] leading-snug">
              {booking.address || 'Location pinpointed via GPS'}
            </p>
          </div>
        </div>

        {/* Worker Info & Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {booking.worker_name && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7]">
              <div className="w-9 h-9 rounded-xl bg-[#14524C] text-[#FFFFFF] flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#3A423E] uppercase tracking-wider font-semibold">Assigned Specialist</p>
                <p className="text-xs sm:text-sm text-[#1B2420] font-bold truncate">{booking.worker_name}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7]">
            <div className="w-9 h-9 rounded-xl bg-[#D68C31]/15 text-[#D68C31] flex items-center justify-center font-bold text-xs shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#3A423E] uppercase tracking-wider font-semibold">Scheduled Slot</p>
              <p className="text-xs sm:text-sm text-[#1B2420] font-bold">
                {booking.scheduled_date} • {booking.scheduled_time}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {position && !isCancelled && (
          <motion.a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-bold text-[#14524C] bg-[#EEF1EE] border border-[#D8D3C7] hover:bg-[#FFFFFF] hover:border-[#14524C] transition-colors shadow-none"
          >
            <Navigation2 className="w-4 h-4" />
            <span>Open In External Navigation Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </motion.a>
        )}

        {/* Completed Badge */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 rounded-2xl bg-[#4A6741]/10 border border-[#4A6741]/30"
            >
              <CheckCircle className="w-4 h-4 text-[#4A6741]" />
              <p className="text-xs sm:text-sm text-[#4A6741] font-bold">Service Milestone Completed Successfully</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BookingTrackingMap;
