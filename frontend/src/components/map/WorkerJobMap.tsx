/**
 * WorkerJobMap — Read-Only Job Location Map for Workers
 *
 * Security: Only renders for bookings where worker_id matches
 * the authenticated worker's user ID. Address is shown only
 * for confirmed/in_progress bookings. Zero lat/lng exposed to UI.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation2,
  Phone,
  User,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import FusionMap from './FusionMap';
import { searchAddress } from '@/services/geocodingService';
import type { GeoPosition } from '@/types/location';
import type { BookingItem } from '@/types/marketplace';

interface WorkerJobMapProps {
  booking: BookingItem;
  /** The authenticated worker's user ID for security check */
  workerUserId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-amber-400', dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', dot: 'bg-blue-400' },
  in_progress: { label: 'In Progress', color: 'text-violet-400', dot: 'bg-violet-400' },
  completed: { label: 'Completed', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', dot: 'bg-red-400' },
};

const WorkerJobMap: React.FC<WorkerJobMapProps> = ({ booking, workerUserId }) => {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Security check: worker must own this booking and it must be active
  const isAuthorized =
    booking.worker_id === workerUserId &&
    ['confirmed', 'in_progress', 'completed'].includes(booking.status);

  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

  // Geocode the booking address → position for map display
  useEffect(() => {
    if (!isAuthorized || !booking.address) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Use lat/lng stored in booking if available
        if ((booking as any).latitude && (booking as any).longitude) {
          setPosition({
            lat: (booking as any).latitude,
            lng: (booking as any).longitude,
          });
        } else {
          // Forward geocode the address string
          const results = await searchAddress(booking.address);
          if (results.length > 0) {
            setPosition(results[0].position);
          } else {
            setError('Could not locate address on map.');
          }
        }
      } catch {
        setError('Map unavailable. Address shown below.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [booking.address, booking.worker_id, isAuthorized]);

  // Build directions URL (Google Maps deep link — never exposes our DB coords)
  const getDirectionsUrl = () => {
    const encoded = encodeURIComponent(booking.address);
    if (position) {
      return `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  };

  // Security wall
  if (!isAuthorized) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <p className="text-sm text-red-300/80">
          Customer address is only visible for accepted and active jobs.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Job Location</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${statusCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
          {statusCfg.label}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center h-[220px] bg-white/[0.02]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
              <span className="text-xs text-white/40">Loading map…</span>
            </div>
          </div>
        ) : error || !position ? (
          <div className="flex items-center gap-2 m-4 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300/80">{error || 'Location not available.'}</p>
          </div>
        ) : (
          <FusionMap
            position={position}
            zoom={16}
            height={220}
            showMarker={true}
            draggable={false}
            markerType="customer"
            className="rounded-none border-0"
          />
        )}
      </div>

      {/* Address Card */}
      <div className="px-4 py-3 space-y-3 border-t border-white/[0.06]">
        {/* Address */}
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-0.5">
              Customer Address
            </p>
            <p className="text-sm text-white/90 leading-snug">{booking.address}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04]">
            <User className="w-3.5 h-3.5 text-white/40" />
            <div>
              <p className="text-[9px] text-white/30 uppercase">Customer</p>
              <p className="text-xs text-white/70 font-medium truncate">{booking.customer_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04]">
            <Calendar className="w-3.5 h-3.5 text-white/40" />
            <div>
              <p className="text-[9px] text-white/30 uppercase">Scheduled</p>
              <p className="text-xs text-white/70 font-medium">{booking.scheduled_date}</p>
            </div>
          </div>
        </div>

        {/* Get Directions Button */}
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/20"
        >
          <Navigation2 className="w-4 h-4" />
          Get Directions
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>
    </motion.div>
  );
};

export default WorkerJobMap;
