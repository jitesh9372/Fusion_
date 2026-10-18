import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  Wallet,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { PaymentItem } from '@/types/marketplace';

export interface PayoutDetails {
  method: 'upi' | 'bank';
  upiId?: string;
  accountNumber?: string;
  ifsc?: string;
  beneficiaryName?: string;
}

interface WorkerEarningsViewProps {
  wallet: { balance: number; pendingPayout: number; totalEarned: number };
  payments: PaymentItem[];
  withdrawalModalOpen: boolean;
  setWithdrawalModalOpen: (open: boolean) => void;
  withdrawalAmount: string;
  setWithdrawalAmount: (amount: string) => void;
  onRequestWithdrawal: (e: React.FormEvent, payoutDetails: PayoutDetails) => void;
}

export const WorkerEarningsView: React.FC<WorkerEarningsViewProps> = ({
  wallet,
  payments,
  withdrawalModalOpen,
  setWithdrawalModalOpen,
  withdrawalAmount,
  setWithdrawalAmount,
  onRequestWithdrawal,
}) => {
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestWithdrawal(e, {
      method: payoutMethod,
      upiId: upiId.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      beneficiaryName: beneficiaryName.trim(),
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420] flex items-center gap-2.5">
            <Wallet className="w-8 h-8 text-[#4A6741]" />
            Cooperative Wallet & Earnings
          </h1>
          <p className="text-xs text-[#3A423E]/80 mt-1">
            Transparent escrow settlements with 90% direct artisan payout and automated mutual dividend splits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setWithdrawalModalOpen(true)}
          disabled={wallet.balance <= 0}
          className="px-5 py-2.5 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Payout Withdrawal</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Career Earnings */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-1 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-[#3A423E]/70">Total Career Earnings</span>
          <p className="text-3xl font-black text-[#4A6741] flex items-center gap-1">
            <IndianRupee className="w-6 h-6 stroke-[2.5]" />
            {wallet.totalEarned.toFixed(2)}
          </p>
          <span className="text-[10px] text-[#3A423E]/60 block pt-1">
            All-time earnings from completed appointments
          </span>
        </div>

        {/* Withdrawable Balance */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-1 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-[#3A423E]/70">Available Wallet Balance</span>
          <p className="text-3xl font-black text-[#14524C] flex items-center gap-1">
            <IndianRupee className="w-6 h-6 stroke-[2.5]" />
            {wallet.balance.toFixed(2)}
          </p>
          <div className="pt-1">
            <span className="text-[10px] text-[#14524C] font-extrabold bg-[#14524C]/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Eligible for instant UPI / Bank payout
            </span>
          </div>
        </div>

        {/* Mutual Cooperative Dividend */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] space-y-1 shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-semibold text-[#3A423E]/70">Mutual Dividend Share</span>
          <p className="text-3xl font-black text-[#D68C31] flex items-center gap-1">
            <IndianRupee className="w-6 h-6 stroke-[2.5]" />
            {(wallet.totalEarned * 0.05).toFixed(2)}
          </p>
          <div className="pt-1">
            <span className="text-[10px] text-[#9A621C] font-extrabold bg-[#D68C31]/15 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Distributed from 10% platform mutual pool
            </span>
          </div>
        </div>
      </div>

      {/* TRANSACTION & SETTLEMENT HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1B2420]">Settlement & Withdrawal Log</h2>
            <p className="text-xs text-[#3A423E]/80">
              Complete history of verified payments, platform escrow releases, and bank withdrawals.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EEF1EE] text-[#1B2420] border border-[#D8D3C7]">
            {payments.length} Transactions
          </span>
        </div>

        <div className="space-y-3">
          {payments.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] text-[#3A423E]/70 text-xs shadow-sm space-y-2">
              <Wallet className="w-8 h-8 mx-auto text-[#4A6741]/50" />
              <p className="font-bold text-[#1B2420]">No financial transactions recorded yet</p>
              <p className="text-[11px] max-w-sm mx-auto">
                Once you complete client service appointments, your 90% payout will automatically reflect here.
              </p>
            </div>
          ) : (
            payments.map(p => {
              const isWithdrawal = Number(p.worker_payout) < 0;
              const displayAmount = Math.abs(Number(p.worker_payout) || Number(p.amount) * 0.9);

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isWithdrawal
                          ? 'bg-[#9C4A34]/10 text-[#9C4A34] border border-[#9C4A34]/20'
                          : 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20'
                      }`}
                    >
                      {isWithdrawal ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-[#1B2420]">
                        {p.service_title || (isWithdrawal ? 'Payout Withdrawal' : 'Service Appointment')}
                      </h4>
                      <p className="text-xs text-[#3A423E]/70 flex items-center gap-1.5 flex-wrap">
                        <span>Invoice #{p.id.slice(-8)}</span>
                        <span>•</span>
                        <span>{p.payment_method || 'Cooperative Escrow'}</span>
                        {p.created_at && (
                          <>
                            <span>•</span>
                            <span>{new Date(p.created_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#D8D3C7]/40">
                    <span
                      className={`text-base font-black flex items-center gap-0.5 ${
                        isWithdrawal ? 'text-[#9C4A34]' : 'text-[#4A6741]'
                      }`}
                    >
                      {isWithdrawal ? '-' : '+'}
                      <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                      {displayAmount.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                        p.status === 'paid'
                          ? 'bg-[#4A6741]/10 text-[#4A6741] border-[#4A6741]/30'
                          : 'bg-[#D68C31]/15 text-[#9A621C] border-[#D68C31]/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      <AnimatePresence>
        {withdrawalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-2xl space-y-5 text-xs"
            >
              <div className="space-y-1 border-b border-[#D8D3C7] pb-3">
                <h3 className="text-base font-bold text-[#1B2420] flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-[#4A6741]" />
                  Request Payout Withdrawal
                </h3>
                <p className="text-xs text-[#3A423E]/80">
                  Transferred directly via UPI or IMPS within 2 business hours.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Amount input */}
                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-bold block">
                    Withdrawal Amount (₹ INR) <span className="text-[#9C4A34]">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A423E]" />
                    <input
                      type="number"
                      required
                      max={wallet.balance}
                      min={10}
                      value={withdrawalAmount}
                      onChange={e => setWithdrawalAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-[#EEF1EE] border border-[#D8D3C7] rounded-2xl text-[#1B2420] font-bold text-base focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF]"
                    />
                  </div>
                  <span className="text-[10px] text-[#3A423E]/70 block font-semibold">
                    Max withdrawable: ₹{wallet.balance.toFixed(2)}
                  </span>
                </div>

                {/* Payout destination selector */}
                <div className="space-y-2">
                  <label className="text-[#1B2420] font-bold block">Transfer Destination</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('upi')}
                      className={`p-3 rounded-2xl border flex items-center gap-2 font-bold transition-all text-left ${
                        payoutMethod === 'upi'
                          ? 'border-[#4A6741] bg-[#4A6741]/10 text-[#4A6741]'
                          : 'border-[#D8D3C7] bg-[#EEF1EE] text-[#3A423E]'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Instant UPI ID</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank')}
                      className={`p-3 rounded-2xl border flex items-center gap-2 font-bold transition-all text-left ${
                        payoutMethod === 'bank'
                          ? 'border-[#4A6741] bg-[#4A6741]/10 text-[#4A6741]'
                          : 'border-[#D8D3C7] bg-[#EEF1EE] text-[#3A423E]'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Bank Account (IMPS)</span>
                    </button>
                  </div>
                </div>

                {payoutMethod === 'upi' ? (
                  <div className="space-y-1.5">
                    <label className="text-[#1B2420] font-bold block">
                      UPI ID (VPA) <span className="text-[#9C4A34]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF]"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[#1B2420] font-bold block">
                        Account Holder Full Name <span className="text-[#9C4A34]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="As on Bank Passbook"
                        value={beneficiaryName}
                        onChange={e => setBeneficiaryName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[#1B2420] font-bold block">
                          Bank Account Number <span className="text-[#9C4A34]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Account Number"
                          value={accountNumber}
                          onChange={e => setAccountNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[#1B2420] font-bold block">
                          IFSC Code <span className="text-[#9C4A34]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SBIN0001234"
                          value={ifsc}
                          onChange={e => setIfsc(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] uppercase focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setWithdrawalModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[#3A423E] hover:text-[#1B2420] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Withdrawal</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkerEarningsView;
