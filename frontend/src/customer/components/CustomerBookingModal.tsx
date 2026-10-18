import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import AddressPickerMap from '@/components/map/AddressPickerMap';
import type { ServiceItem, WorkerProfile } from '@/types/marketplace';
import type { GeoPosition } from '@/types/location';

interface CustomerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceItem | null;
  setSelectedService: (service: ServiceItem | null) => void;
  selectedWorker: WorkerProfile | null;
  setSelectedWorker: (worker: WorkerProfile | null) => void;
  services: ServiceItem[];
  workers: WorkerProfile[];
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingTime: string;
  setBookingTime: (time: string) => void;
  bookingAddress: string;
  setBookingAddress: (address: string) => void;
  bookingPosition: GeoPosition | null;
  setBookingPosition: (pos: GeoPosition | null) => void;
  showMapPicker: boolean;
  setShowMapPicker: (show: boolean | ((prev: boolean) => boolean)) => void;
  bookingNotes: string;
  setBookingNotes: (notes: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CustomerBookingModal: React.FC<CustomerBookingModalProps> = ({
  isOpen,
  onClose,
  selectedService,
  setSelectedService,
  selectedWorker,
  setSelectedWorker,
  services,
  workers,
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  bookingAddress,
  setBookingAddress,
  setBookingPosition,
  showMapPicker,
  setShowMapPicker,
  bookingNotes,
  setBookingNotes,
  onSubmit,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2420]/60 backdrop-blur-md overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
            className="w-full max-w-lg p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-5 my-8 shadow-2xl"
          >

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1B2420]">Book Cooperative Service</h3>
            <p className="text-xs text-[#3A423E]">
              Select date, time, and exact address on the live map. Escrow protection is automatically activated.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            {/* Service Selection */}
            <div className="space-y-1.5">
              <label className="text-[#3A423E] font-semibold">Service Category</label>
              <select
                value={selectedService?.id || ''}
                onChange={e => {
                  const s = services.find(srv => srv.id === e.target.value);
                  if (s) {
                    setSelectedService(s);
                    const match = workers.find(
                      w => w.trade_category.toLowerCase() === s.category.toLowerCase()
                    );
                    if (match) setSelectedWorker(match);
                  }
                }}
                className="w-full px-3 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] focus:border-[#14524C] rounded-xl text-[#1B2420] focus:outline-none"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} (₹{s.base_price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Worker Match Selection */}
            <div className="space-y-1.5">
              <label className="text-[#3A423E] font-semibold">Assigned Specialist</label>
              <select
                value={selectedWorker?.id || ''}
                onChange={e => {
                  const w = workers.find(wrk => wrk.id === e.target.value);
                  if (w) setSelectedWorker(w);
                }}
                className="w-full px-3 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] focus:border-[#14524C] rounded-xl text-[#1B2420] focus:outline-none"
              >
                {workers
                  .filter(
                    w =>
                      !selectedService ||
                      w.trade_category.toLowerCase() === selectedService.category.toLowerCase()
                  )
                  .map(w => (
                    <option key={w.id} value={w.id}>
                      {w.full_name} ({w.trade_category} • ₹{w.hourly_rate}/hr • {w.rating}★)
                    </option>
                  ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#3A423E] font-semibold">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] focus:border-[#14524C] rounded-xl text-[#1B2420] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#3A423E] font-semibold">Time Slot</label>
                <select
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] focus:border-[#14524C] rounded-xl text-[#1B2420] focus:outline-none"
                >
                  <option value="09:00 AM">09:00 AM - Morning</option>
                  <option value="11:00 AM">11:00 AM - Late Morning</option>
                  <option value="02:00 PM">02:00 PM - Afternoon</option>
                  <option value="04:30 PM">04:30 PM - Late Afternoon</option>
                  <option value="06:00 PM">06:00 PM - Evening</option>
                </select>
              </div>
            </div>

            {/* Address — Interactive Map Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[#3A423E] font-semibold">Service Address</label>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(v => !v)}
                  className="text-[10px] text-[#14524C] font-bold hover:underline transition-colors"
                >
                  {showMapPicker ? '− Hide Map' : '+ Pick on Map'}
                </button>
              </div>

              {/* Confirmed address preview pill */}
              {bookingAddress && !showMapPicker && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#4A6741]/10 border border-[#4A6741]/30">
                  <MapPin className="w-3.5 h-3.5 text-[#4A6741] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#4A6741] font-semibold leading-snug">{bookingAddress}</p>
                </div>
              )}

              {/* Fallback placeholder input if map is hidden and no address */}
              {!showMapPicker && !bookingAddress && (
                <input
                  type="text"
                  value={bookingAddress}
                  onChange={e => setBookingAddress(e.target.value)}
                  placeholder="Click '+ Pick on Map' to select your location…"
                  className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#3A423E] text-xs focus:outline-none cursor-pointer"
                  onClick={() => setShowMapPicker(true)}
                  readOnly
                />
              )}

              {/* Map Picker (expanded) */}
              {showMapPicker && (
                <div className="mt-2 rounded-2xl overflow-hidden border border-[#D8D3C7]">
                  <AddressPickerMap
                    initialAddress={bookingAddress}
                    onAddressConfirmed={(addr, pos) => {
                      setBookingAddress(addr);
                      setBookingPosition(pos);
                      setShowMapPicker(false);
                    }}
                    onCancel={() => setShowMapPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[#3A423E] font-semibold">Job Description / Specific Issue</label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={e => setBookingNotes(e.target.value)}
                placeholder="Describe symptoms, equipment model, or specific requirements..."
                className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] focus:border-[#14524C] rounded-xl text-[#1B2420] placeholder-[#3A423E]/60 focus:outline-none resize-none"
              />
            </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 rounded-xl text-[#3A423E] hover:text-[#1B2420] font-semibold transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2.5 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-bold transition-colors shadow-sm"
                >
                  Confirm Booking
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomerBookingModal;
