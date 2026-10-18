import React from 'react';
import { HeartHandshake, CheckCircle2, XCircle } from 'lucide-react';
import type { WelfareClaim } from '@/types/marketplace';

interface AdminWelfareClaimsTableProps {
  claims: WelfareClaim[];
  onUpdateClaimStatus: (claimId: string, status: 'approved' | 'rejected') => void;
}

export const AdminWelfareClaimsTable: React.FC<AdminWelfareClaimsTableProps> = ({
  claims,
  onUpdateClaimStatus,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">
          Mutual Welfare Fund Claims
        </h2>
        <p className="text-xs text-[#3A423E]/80">
          Review and disburse cooperative peer subsidies and equipment grants.
        </p>
      </div>

      <div className="space-y-4">
        {claims.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-2 shadow-sm">
            <HeartHandshake className="w-10 h-10 text-[#3A423E]/30 mx-auto" />
            <p className="text-sm font-semibold text-[#1B2420]">No pending welfare claims.</p>
          </div>
        ) : (
          claims.map(c => (
            <div
              key={c.id}
              className="p-6 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      c.status === 'approved'
                        ? 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20'
                        : c.status === 'pending'
                        ? 'bg-[#D68C31]/15 text-[#9A621C] border border-[#D68C31]/30'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {c.status}
                  </span>
                  <h4 className="text-sm font-bold text-[#1B2420]">{c.claim_type}</h4>
                </div>
                <p className="text-xs text-[#3A423E]">{c.description}</p>
                <div className="flex items-center gap-4 text-xs text-[#3A423E]/60">
                  <span>Worker ID: #{c.worker_id.slice(-6)}</span>
                  <span>Filed: {c.created_at?.slice(0, 10)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-[#3A423E]/70 block uppercase font-bold tracking-wider">
                    Requested Grant
                  </span>
                  <span className="text-xl font-black text-[#9C4A34]">
                    ₹{(c.amount ?? c.amount_requested ?? 0).toFixed(2)}
                  </span>
                </div>

                {c.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateClaimStatus(c.id, 'approved')}
                      className="px-4 py-2 rounded-xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Approve Grant
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateClaimStatus(c.id, 'rejected')}
                      className="px-3 py-2 rounded-xl bg-[#EEF1EE] hover:bg-red-50 text-[#3A423E] hover:text-red-600 text-xs font-semibold border border-[#D8D3C7] transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminWelfareClaimsTable;
