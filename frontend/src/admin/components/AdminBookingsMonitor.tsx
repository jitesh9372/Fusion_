import React from 'react';
import type { BookingItem } from '@/types/marketplace';

interface AdminBookingsMonitorProps {
  bookings: BookingItem[];
  bookingFilter: string;
  setBookingFilter: (filter: string) => void;
}

export const AdminBookingsMonitor: React.FC<AdminBookingsMonitorProps> = ({
  bookings,
  bookingFilter,
  setBookingFilter,
}) => {
  const filteredBookings = bookings.filter(
    b => bookingFilter === 'all' || b.status === bookingFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">System Bookings Monitor</h2>
          <p className="text-xs text-[#3A423E]/80">
            Real-time tracking of all customer requests, active technician dispatches, and completions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setBookingFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                bookingFilter === f
                  ? 'bg-[#9C4A34] text-white shadow-sm'
                  : 'bg-[#FFFFFF] text-[#3A423E] hover:text-[#1B2420] border border-[#D8D3C7]'
              }`}
            >
              {f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EEF1EE] text-[#3A423E]/80 uppercase font-bold text-[10px] tracking-wider border-b border-[#D8D3C7]">
              <tr>
                <th className="py-4 px-6">Booking ID & Service</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Artisan Specialist</th>
                <th className="py-4 px-6">Scheduled Time</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Status / Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D3C7] text-[#1B2420]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#3A423E]/60">
                    No bookings found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-[#F4F6F4] transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-[#1B2420] text-sm">{b.service_title}</p>
                      <span className="text-[10px] text-[#3A423E]/60 font-mono">#{b.id.slice(-8)}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-[#1B2420]">{b.customer_name}</td>
                    <td className="py-4 px-6 text-[#4A6741] font-semibold">
                      {b.worker_name || 'Unassigned / Open Dispatch'}
                    </td>
                    <td className="py-4 px-6 text-[#3A423E]">
                      {b.scheduled_date} at {b.scheduled_time}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-[#1B2420]">
                      ₹{b.total_price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                          b.status === 'completed'
                            ? 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20'
                            : b.status === 'in_progress'
                            ? 'bg-[#14524C]/10 text-[#14524C] border border-[#14524C]/20'
                            : b.status === 'confirmed'
                            ? 'bg-[#D68C31]/15 text-[#9A621C] border border-[#D68C31]/30'
                            : 'bg-[#EEF1EE] text-[#3A423E] border border-[#D8D3C7]'
                        }`}
                      >
                        {b.status} • {b.stage}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsMonitor;
