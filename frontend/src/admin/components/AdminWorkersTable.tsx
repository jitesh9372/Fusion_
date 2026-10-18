import React from 'react';
import { Search, ShieldCheck, CheckCircle2, XCircle, Star, User } from 'lucide-react';
import type { WorkerProfile, VerificationStatus } from '@/types/marketplace';

interface AdminWorkersTableProps {
  workers: WorkerProfile[];
  workerSearch: string;
  setWorkerSearch: (search: string) => void;
  onUpdateVerification: (workerId: string, status: VerificationStatus) => void;
}

export const AdminWorkersTable: React.FC<AdminWorkersTableProps> = ({
  workers,
  workerSearch,
  setWorkerSearch,
  onUpdateVerification,
}) => {
  const filteredWorkers = workers.filter(
    w =>
      w.full_name?.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.trade_category.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.bio?.toLowerCase().includes(workerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">Artisan Verification Queue</h2>
          <p className="text-xs text-[#3A423E]/80">
            Review certified background audits, skill credentials, and activate live status.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A423E]/40" />
          <input
            type="text"
            placeholder="Search worker by name or skill..."
            value={workerSearch}
            onChange={e => setWorkerSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#D8D3C7] rounded-2xl text-[#1B2420] text-xs placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#9C4A34] shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EEF1EE] text-[#3A423E]/80 uppercase font-bold text-[10px] tracking-wider border-b border-[#D8D3C7]">
              <tr>
                <th className="py-4 px-6">Worker Specialist</th>
                <th className="py-4 px-6">Trade Category</th>
                <th className="py-4 px-6">Hourly Rate</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6">Verification Status</th>
                <th className="py-4 px-6 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D3C7] text-[#1B2420]">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#3A423E]/60">
                    No workers found matching your query.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(w => (
                  <tr key={w.id} className="hover:bg-[#F4F6F4] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#14524C] flex items-center justify-center font-bold text-white text-xs shadow-sm">
                          {w.full_name?.charAt(0) || 'W'}
                        </div>
                        <div>
                          <p className="font-bold text-[#1B2420] text-sm">{w.full_name}</p>
                          <span className="text-[10px] text-[#3A423E]/60 font-mono">#{w.id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20 font-semibold">
                        {w.trade_category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#1B2420]">
                      ₹{w.hourly_rate}/hr
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-[#D68C31] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#D68C31]" />
                        <span>{w.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                          w.verification_status === 'verified'
                            ? 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20'
                            : w.verification_status === 'pending'
                            ? 'bg-[#D68C31]/15 text-[#9A621C] border border-[#D68C31]/30'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        {w.verification_status === 'verified' && <ShieldCheck className="w-3 h-3" />}
                        {w.verification_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {w.verification_status !== 'verified' && (
                        <button
                          type="button"
                          onClick={() => onUpdateVerification(w.id, 'verified')}
                          className="px-3 py-1.5 rounded-xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Approve
                        </button>
                      )}
                      {w.verification_status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => onUpdateVerification(w.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-[#EEF1EE] hover:bg-red-50 text-[#3A423E] hover:text-red-600 border border-[#D8D3C7] text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      )}
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

export default AdminWorkersTable;
