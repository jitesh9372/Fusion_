import React, { useState } from 'react';
import {
  Settings, Shield, IndianRupee, Clock, Bell, CheckCircle2,
  AlertTriangle, Save, RefreshCw, Sliders, FileText, ToggleLeft, ToggleRight
} from 'lucide-react';

interface EcosystemPolicy {
  platformFeePercent: number;
  welfareContributionPercent: number;
  escrowReleaseHours: number;
  disputeResolutionDays: number;
  minWithdrawalAmount: number;
  maxDailyWithdrawal: number;
  autoApproveVerifiedArtisans: boolean;
  requireAadhaarVerification: boolean;
  enableSmsNotifications: boolean;
  maintenanceMode: boolean;
}

const defaultPolicies: EcosystemPolicy = {
  platformFeePercent: 10,
  welfareContributionPercent: 2,
  escrowReleaseHours: 24,
  disputeResolutionDays: 3,
  minWithdrawalAmount: 500,
  maxDailyWithdrawal: 25000,
  autoApproveVerifiedArtisans: false,
  requireAadhaarVerification: true,
  enableSmsNotifications: true,
  maintenanceMode: false,
};

export const AdminSettingsView: React.FC = () => {
  const [policies, setPolicies] = useState<EcosystemPolicy>(() => {
    try {
      const saved = localStorage.getItem('fusion_admin_policies');
      return saved ? JSON.parse(saved) : defaultPolicies;
    } catch {
      return defaultPolicies;
    }
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem('fusion_admin_policies', JSON.stringify(policies));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setPolicies(defaultPolicies);
    localStorage.removeItem('fusion_admin_policies');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B2420] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#9C4A34]" />
            Ecosystem Policies & Controls
          </h2>
          <p className="text-xs text-[#3A423E]/80 mt-0.5">
            Configure marketplace financial splits, escrow settlement timers, and verification requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D8D3C7] bg-[#FFFFFF] text-xs font-bold text-[#3A423E] hover:bg-[#EEF1EE] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#9C4A34] text-white text-xs font-bold hover:bg-[#853D2A] shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#4A6741]/10 border border-[#4A6741]/30 text-[#4A6741] text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Ecosystem policies have been updated successfully and saved to platform storage.
        </div>
      )}

      {/* Policy Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marketplace Economics */}
        <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D8D3C7]">
            <div className="w-8 h-8 rounded-xl bg-[#9C4A34]/10 flex items-center justify-center text-[#9C4A34]">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1B2420]">Financial Take-Rates & Splits</h3>
              <p className="text-[11px] text-[#3A423E]/70">Platform commissions and worker welfare allocation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1B2420] mb-1">
                Platform Commission Fee: <span className="text-[#9C4A34]">{policies.platformFeePercent}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={policies.platformFeePercent}
                onChange={e => setPolicies({ ...policies, platformFeePercent: Number(e.target.value) })}
                className="w-full accent-[#9C4A34]"
              />
              <span className="text-[10px] text-[#3A423E]/60">Deducted from the artisan payout per completed booking.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2420] mb-1">
                Worker Welfare Fund Contribution: <span className="text-[#4A6741]">{policies.welfareContributionPercent}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={policies.welfareContributionPercent}
                onChange={e => setPolicies({ ...policies, welfareContributionPercent: Number(e.target.value) })}
                className="w-full accent-[#4A6741]"
              />
              <span className="text-[10px] text-[#3A423E]/60">Pooled directly into healthcare, insurance, and emergency artisan aid.</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[#1B2420] mb-1">Min. Payout (₹)</label>
                <input
                  type="number"
                  value={policies.minWithdrawalAmount}
                  onChange={e => setPolicies({ ...policies, minWithdrawalAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8D3C7] bg-[#EEF1EE]/50 focus:outline-none focus:border-[#9C4A34]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1B2420] mb-1">Max Daily Payout (₹)</label>
                <input
                  type="number"
                  value={policies.maxDailyWithdrawal}
                  onChange={e => setPolicies({ ...policies, maxDailyWithdrawal: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8D3C7] bg-[#EEF1EE]/50 focus:outline-none focus:border-[#9C4A34]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Escrow & Timers */}
        <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D8D3C7]">
            <div className="w-8 h-8 rounded-xl bg-[#14524C]/10 flex items-center justify-center text-[#14524C]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1B2420]">Escrow & Dispute Timelines</h3>
              <p className="text-[11px] text-[#3A423E]/70">Auto-release duration and dispute response SLA</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1B2420] mb-1">
                Auto-Release Escrow after Completion: <span className="text-[#14524C]">{policies.escrowReleaseHours} Hours</span>
              </label>
              <input
                type="range"
                min={6}
                max={72}
                step={6}
                value={policies.escrowReleaseHours}
                onChange={e => setPolicies({ ...policies, escrowReleaseHours: Number(e.target.value) })}
                className="w-full accent-[#14524C]"
              />
              <span className="text-[10px] text-[#3A423E]/60">Funds release automatically to the artisan unless the customer raises a dispute.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2420] mb-1">
                Dispute Resolution SLA: <span className="text-[#D68C31]">{policies.disputeResolutionDays} Days</span>
              </label>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={policies.disputeResolutionDays}
                onChange={e => setPolicies({ ...policies, disputeResolutionDays: Number(e.target.value) })}
                className="w-full accent-[#D68C31]"
              />
              <span className="text-[10px] text-[#3A423E]/60">Standard arbitrator review window before escalation.</span>
            </div>
          </div>
        </div>

        {/* Verification & Compliance */}
        <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D8D3C7]">
            <div className="w-8 h-8 rounded-xl bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1B2420]">Security & Identity Audits</h3>
              <p className="text-[11px] text-[#3A423E]/70">Worker onboarding verification constraints</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EEF1EE]/50 border border-[#D8D3C7]/60">
              <div>
                <p className="text-xs font-bold text-[#1B2420]">Mandatory Aadhaar / Govt ID</p>
                <p className="text-[10px] text-[#3A423E]/70">Require identity document before artisan can take bookings</p>
              </div>
              <button
                type="button"
                onClick={() => setPolicies({ ...policies, requireAadhaarVerification: !policies.requireAadhaarVerification })}
                className="text-[#14524C]"
              >
                {policies.requireAadhaarVerification ? (
                  <ToggleRight className="w-8 h-8 text-[#14524C]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-[#3A423E]/40" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EEF1EE]/50 border border-[#D8D3C7]/60">
              <div>
                <p className="text-xs font-bold text-[#1B2420]">Auto-Verify Certified Workers</p>
                <p className="text-[10px] text-[#3A423E]/70">Workers with recognized vocational certs get fast-tracked</p>
              </div>
              <button
                type="button"
                onClick={() => setPolicies({ ...policies, autoApproveVerifiedArtisans: !policies.autoApproveVerifiedArtisans })}
                className="text-[#14524C]"
              >
                {policies.autoApproveVerifiedArtisans ? (
                  <ToggleRight className="w-8 h-8 text-[#14524C]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-[#3A423E]/40" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications & System */}
        <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D8D3C7]">
            <div className="w-8 h-8 rounded-xl bg-[#D68C31]/10 flex items-center justify-center text-[#D68C31]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1B2420]">System & Alerts</h3>
              <p className="text-[11px] text-[#3A423E]/70">Platform dispatch notifications and status</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EEF1EE]/50 border border-[#D8D3C7]/60">
              <div>
                <p className="text-xs font-bold text-[#1B2420]">SMS / WhatsApp Booking Alerts</p>
                <p className="text-[10px] text-[#3A423E]/70">Send instant job notifications to workers via mobile</p>
              </div>
              <button
                type="button"
                onClick={() => setPolicies({ ...policies, enableSmsNotifications: !policies.enableSmsNotifications })}
                className="text-[#14524C]"
              >
                {policies.enableSmsNotifications ? (
                  <ToggleRight className="w-8 h-8 text-[#14524C]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-[#3A423E]/40" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EEF1EE]/50 border border-[#D8D3C7]/60">
              <div>
                <p className="text-xs font-bold text-red-600">Platform Maintenance Mode</p>
                <p className="text-[10px] text-[#3A423E]/70">Temporarily freeze new booking checkouts for updates</p>
              </div>
              <button
                type="button"
                onClick={() => setPolicies({ ...policies, maintenanceMode: !policies.maintenanceMode })}
                className="text-red-500"
              >
                {policies.maintenanceMode ? (
                  <ToggleRight className="w-8 h-8 text-red-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-[#3A423E]/40" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsView;
