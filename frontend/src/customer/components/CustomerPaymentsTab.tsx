import React from 'react';
import { ShieldCheck, CreditCard } from 'lucide-react';
import type { PaymentItem } from '@/types/marketplace';

interface CustomerPaymentsTabProps {
  payments: PaymentItem[];
}

export const CustomerPaymentsTab: React.FC<CustomerPaymentsTabProps> = ({ payments }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1B2420] tracking-tight">
          Escrow & Payment History
        </h1>
        <p className="text-xs text-[#3A423E]">
          100% money-back escrow guarantees that technicians get paid only after customer satisfaction.
        </p>
      </div>

      {/* Escrow Guarantee Banner */}
      <div className="p-6 rounded-3xl border border-[#4A6741]/30 bg-[#4A6741]/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#4A6741]/20 text-[#4A6741] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1B2420]">FUSION Escrow Protection Active</h3>
            <p className="text-xs text-[#3A423E]">
              Funds are safely locked in cooperative escrow until you verify the completed service.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#4A6741] text-[#FFFFFF]">
          Protected
        </span>
      </div>

      {/* Payment Invoices List */}
      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="p-12 text-center border border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-2">
            <CreditCard className="w-8 h-8 text-[#3A423E]/40 mx-auto" />
            <p className="text-sm font-semibold text-[#3A423E]">No payment invoices yet.</p>
          </div>
        ) : (
          payments.map(p => (
            <div
              key={p.id}
              className="p-5 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] flex items-center justify-between"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#1B2420]">{p.service_title || 'Service Settlement'}</h4>
                <p className="text-xs text-[#3A423E]">
                  Invoice #{p.id.slice(-8)} • Order #{p.booking_id.slice(-8)} • Paid via Escrow
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold text-[#1B2420]">
                  ₹{p.amount.toFixed(2)}
                </span>
                <span className="block text-[10px] uppercase font-bold text-[#14524C]">
                  {p.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerPaymentsTab;
