import React from 'react';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { DisputeItem } from '@/types/marketplace';

interface AdminDisputesTableProps {
  disputes: DisputeItem[];
  onResolveDispute: (disputeId: string, resolution: 'resolved' | 'dismissed') => void;
}

export const AdminDisputesTable: React.FC<AdminDisputesTableProps> = ({
  disputes,
  onResolveDispute,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">
          Cooperative Dispute Arbitration
        </h2>
        <p className="text-xs text-[#3A423E]/80">
          Mediate customer-worker claims with frozen escrow balances.
        </p>
      </div>

      <div className="space-y-4">
        {disputes.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-2 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-[#4A6741] mx-auto" />
            <p className="text-sm font-semibold text-[#1B2420]">
              Zero open disputes. All appointments operating smoothly!
            </p>
          </div>
        ) : (
          disputes.map(dsp => (
            <div
              key={dsp.id}
              className="p-6 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      dsp.status === 'open'
                        ? 'bg-[#D68C31]/15 text-[#9A621C] border border-[#D68C31]/30'
                        : dsp.status === 'resolved'
                        ? 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20'
                        : 'bg-[#EEF1EE] text-[#3A423E]/70 border border-[#D8D3C7]'
                    }`}
                  >
                    {dsp.status}
                  </span>
                  <h4 className="text-sm font-bold text-[#1B2420]">Order #{dsp.booking_id.slice(-8)}</h4>
                </div>
                <p className="text-xs font-semibold text-[#9C4A34]">{dsp.reason}</p>
                <p className="text-xs text-[#3A423E] italic bg-[#EEF1EE] p-3 rounded-2xl border border-[#D8D3C7]/60">"{dsp.description}"</p>
                <span className="text-[10px] text-[#3A423E]/60 block">
                  Filed by {dsp.raised_by_name || 'Customer'} on {dsp.created_at?.slice(0, 10)}
                </span>
              </div>

              {dsp.status === 'open' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onResolveDispute(dsp.id, 'resolved')}
                    className="px-4 py-2 rounded-xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Release Escrow to Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolveDispute(dsp.id, 'dismissed')}
                    className="px-4 py-2 rounded-xl bg-[#EEF1EE] hover:bg-[#E2E6E2] text-[#1B2420] font-semibold text-xs border border-[#D8D3C7] transition-all"
                  >
                    Release Escrow to Worker
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDisputesTable;
