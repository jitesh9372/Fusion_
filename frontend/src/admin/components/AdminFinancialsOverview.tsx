import React from 'react';
import { IndianRupee, ShieldCheck, TrendingUp, Layers } from 'lucide-react';
import type { PaymentItem } from '@/types/marketplace';

interface AdminFinancialsOverviewProps {
  payments: PaymentItem[];
}

export const AdminFinancialsOverview: React.FC<AdminFinancialsOverviewProps> = ({ payments }) => {
  const totalVolume = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalFees = payments.reduce((acc, p) => acc + p.platform_fee, 0);
  const totalPayouts = payments.reduce((acc, p) => acc + p.worker_payout, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">Cooperative Financial Ledger</h2>
        <p className="text-xs text-[#3A423E]/80">
          Transparent accounting of escrow reserves, mutual funds, and artisan disbursements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-1 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-[#3A423E]/70">Gross Settled Volume</span>
          <p className="text-3xl font-black text-[#1B2420]">₹{totalVolume.toFixed(2)}</p>
          <span className="text-[10px] text-[#3A423E]/60">100% Client Payments</span>
        </div>
        <div className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-1 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-[#3A423E]/70">Worker Direct Payouts (90%)</span>
          <p className="text-3xl font-black text-[#4A6741]">₹{totalPayouts.toFixed(2)}</p>
          <span className="text-[10px] text-[#4A6741] font-semibold bg-[#4A6741]/10 px-2 py-0.5 rounded-md inline-block">Zero Predatory Deductions</span>
        </div>
        <div className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-1 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-[#3A423E]/70">Cooperative Reserve Pool (10%)</span>
          <p className="text-3xl font-black text-[#9C4A34]">₹{totalFees.toFixed(2)}</p>
          <span className="text-[10px] text-[#9C4A34] font-semibold bg-[#9C4A34]/10 px-2 py-0.5 rounded-md inline-block">Funding Welfare & Server Ops</span>
        </div>
      </div>

      {/* Transaction Records */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#1B2420]">Recent Escrow Settlements</h3>
        {payments.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#D8D3C7] rounded-2xl text-[#3A423E]/60 text-xs bg-[#FFFFFF] shadow-sm">
            No transactions processed yet.
          </div>
        ) : (
          payments.map(p => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#1B2420]">{p.service_title || 'Service Payment'}</h4>
                <p className="text-xs text-[#3A423E]/60">
                  ID #{p.id.slice(-8)} • Customer #{p.customer_id.slice(-6)} → Worker #{p.worker_id?.slice(-6) || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#1B2420]">₹{p.amount.toFixed(2)}</span>
                <span className="block text-[10px] uppercase font-bold text-[#9C4A34]">
                  Fee: ₹{(p.platform_fee || p.amount * 0.1).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFinancialsOverview;
