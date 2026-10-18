import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';
import type { BookingItem } from '@/types/marketplace';

interface CustomerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingItem | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const CustomerPaymentModal: React.FC<CustomerPaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2420]/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-md p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-5"
        >
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1B2420]">Deposit to Cooperative Escrow</h3>
            <p className="text-xs text-[#3A423E]">
              Payment is safely held in cooperative escrow until you approve the completed service.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#3A423E]">Service</span>
                <span className="font-bold text-[#1B2420]">{booking.service_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3A423E]">Specialist</span>
                <span className="font-bold text-[#14524C]">{booking.worker_name || 'Assigned Artisan'}</span>
              </div>
              <div className="flex justify-between border-t border-[#D8D3C7] pt-2">
                <span className="text-[#1B2420] font-bold">Total Amount</span>
                <span className="text-base font-extrabold text-[#14524C]">
                  ₹{booking.total_price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#4A6741]/10 border border-[#4A6741]/30 text-[#4A6741] text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% money-back guarantee with zero dispute settlement fees.</span>
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
                className="px-6 py-2.5 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm Escrow Deposit</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerPaymentModal;
