import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  FileCheck,
  Upload,
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  CreditCard,
  Building,
} from 'lucide-react';
import type { WorkerProfile, VerificationStatus } from '@/types/marketplace';
import {
  uploadWorkerDocument,
  submitWorkerVerification,
} from '@/services/marketplaceService';

interface WorkerVerificationViewProps {
  workerProfile: WorkerProfile | null;
  onProfileUpdated: (updated: Partial<WorkerProfile>) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const WorkerVerificationView: React.FC<WorkerVerificationViewProps> = ({
  workerProfile,
  onProfileUpdated,
  onToast,
}) => {
  const currentStatus: VerificationStatus = workerProfile?.verification_status || 'unverified';

  const [docType, setDocType] = useState('Aadhaar Card');
  const [docNumber, setDocNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reuploadMode, setReuploadMode] = useState(false);

  const handleSubmitDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerProfile) {
      onToast('error', 'Worker profile not loaded.');
      return;
    }
    if (!selectedFile) {
      onToast('error', 'Please attach your government ID document file.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload to Supabase Storage bucket 'worker-documents'
      const fileUrl = await uploadWorkerDocument(workerProfile.id, selectedFile, 'id_document');
      if (!fileUrl) {
        onToast('error', 'Failed to upload document file to secure storage. Please retry.');
        return;
      }

      // 2. Submit verification update to Supabase
      const success = await submitWorkerVerification(workerProfile.id, fileUrl);
      if (success) {
        onProfileUpdated({
          verification_status: 'pending',
          id_document_url: fileUrl,
        });
        setReuploadMode(false);
        setSelectedFile(null);
        setDocNumber('');
        onToast('success', 'Verification documents submitted! Status updated to Under Review.');
      } else {
        onToast('error', 'Failed to update verification status in database.');
      }
    } catch (err: any) {
      onToast('error', 'Verification submission error: ' + (err.message || 'Unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420] flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-[#4A6741]" />
          Artisan Identity Verification
        </h1>
        <p className="text-xs text-[#3A423E]/80 mt-1">
          Cooperative compliance and background authentication for trustworthy, high-paying appointments.
        </p>
      </div>

      {/* STATUS HERO BANNER */}
      {currentStatus === 'verified' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#4A6741] shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#4A6741]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#4A6741] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4A6741]/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-[#1B2420]">Account Verified & Active</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20 text-[10px] font-extrabold uppercase tracking-wide">
                    Cooperative Certified
                  </span>
                </div>
                <p className="text-xs text-[#3A423E]/90 max-w-xl">
                  Your identity and trade credentials have been authenticated. You enjoy top dispatch matching priority, instant escrow payouts, and the verified artisan badge across the marketplace.
                </p>
              </div>
            </div>

            {workerProfile?.id_document_url && (
              <a
                href={workerProfile.id_document_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-[#EEF1EE] hover:bg-[#E2E6E2] text-[#1B2420] border border-[#D8D3C7] text-xs font-bold transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <FileCheck className="w-4 h-4 text-[#4A6741]" />
                <span>View Verified Document</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#3A423E]" />
              </a>
            )}
          </div>
        </motion.div>
      )}

      {currentStatus === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#D68C31] shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#D68C31]/20 text-[#9A621C] flex items-center justify-center shrink-0 border border-[#D68C31]/30">
                <Clock className="w-8 h-8 text-[#D68C31]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[#1B2420]">Verification Under Review</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D68C31]/15 text-[#9A621C] border border-[#D68C31]/30 text-[10px] font-extrabold uppercase">
                    In Review
                  </span>
                </div>
                <p className="text-xs text-[#3A423E]/90 max-w-xl">
                  Your documents are currently being reviewed by the FUSION Cooperative compliance team. Authentication is usually completed within <strong>12 to 24 hours</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {workerProfile?.id_document_url && (
                <a
                  href={workerProfile.id_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-2xl bg-[#EEF1EE] hover:bg-[#E2E6E2] text-[#1B2420] border border-[#D8D3C7] text-xs font-bold transition-all flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4 text-[#D68C31]" />
                  <span>Submitted Document</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#3A423E]" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setReuploadMode(prev => !prev)}
                className="px-4 py-2.5 rounded-2xl bg-[#EEF1EE] hover:bg-[#E2E6E2] text-[#1B2420] border border-[#D8D3C7] text-xs font-bold transition-all"
              >
                {reuploadMode ? 'Cancel Re-upload' : 'Replace Document'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {(currentStatus === 'unverified' || currentStatus === 'rejected') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-sm space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF1EE] text-[#4A6741] flex items-center justify-center shrink-0 border border-[#D8D3C7]">
              <AlertCircle className="w-8 h-8 text-[#D68C31]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#1B2420]">
                  {currentStatus === 'rejected'
                    ? 'Verification Needs Re-submission'
                    : 'Verification Required to Unlock Full Benefits'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#9C4A34]/10 text-[#9C4A34] border border-[#9C4A34]/20 text-[10px] font-extrabold uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-[#3A423E]/90 max-w-2xl">
                Submit a valid government identity card or trade license. Verified artisans earn an average of 45% more, enjoy instant wallet withdrawals, and build credibility with clients.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* DOCUMENT SUBMISSION FORM (shown if unverified, rejected, or reuploadMode) */}
      {(currentStatus === 'unverified' || currentStatus === 'rejected' || reuploadMode) && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#1B2420] flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#4A6741]" />
              Submit Identification Documents
            </h3>
            <p className="text-xs text-[#3A423E]/80 mt-0.5">
              Please provide clear, legible copies. Data is encrypted and stored in private cooperative storage.
            </p>
          </div>

          <form onSubmit={handleSubmitDocuments} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#1B2420] font-bold block">
                  Government Document Type <span className="text-[#9C4A34]">*</span>
                </label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                >
                  <option value="Aadhaar Card">Aadhaar Card (Front & Back)</option>
                  <option value="Voter ID">Voter ID Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                  <option value="Trade Registration Certificate">Trade Registration Certificate</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#1B2420] font-bold block">
                  Document Identification Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. XXXX-XXXX-XXXX"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                />
              </div>
            </div>

            {/* Document File Picker */}
            <div className="space-y-1.5">
              <label className="text-[#1B2420] font-bold block">
                Attach Document File (PDF, PNG, JPG) <span className="text-[#9C4A34]">*</span>
              </label>
              <div className="p-6 rounded-3xl border-2 border-dashed border-[#D8D3C7] bg-[#EEF1EE]/60 hover:bg-[#EEF1EE] transition-all text-center">
                <input
                  type="file"
                  id="id-doc-upload"
                  required
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="id-doc-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#D8D3C7] flex items-center justify-center text-[#4A6741] shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#1B2420]">
                    {selectedFile ? selectedFile.name : `Click here to browse your ${docType} file`}
                  </span>
                  <span className="text-[10px] text-[#3A423E]/70">
                    PDF, PNG, or JPG up to 15MB • Must clearly show your full name and photo
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              {reuploadMode && (
                <button
                  type="button"
                  onClick={() => setReuploadMode(false)}
                  className="px-5 py-2.5 rounded-2xl text-[#3A423E] hover:text-[#1B2420] font-semibold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="px-7 py-3 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] disabled:opacity-50 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Uploading & Encrypting...' : 'Submit Documents for Verification'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VERIFICATION CHECKLIST & SECURITY PLEDGE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741] font-bold">
            1
          </div>
          <h4 className="font-bold text-[#1B2420]">Government Photo ID</h4>
          <p className="text-[#3A423E]/80 text-[11px] leading-relaxed">
            Ensures that every artisan operating on the cooperative network is an authenticated legal professional.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741] font-bold">
            2
          </div>
          <h4 className="font-bold text-[#1B2420]">Instant Payout Access</h4>
          <p className="text-[#3A423E]/80 text-[11px] leading-relaxed">
            Verified artisans have no payout wait times. Complete a job and withdraw your earnings directly to your UPI/bank.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741] font-bold">
            3
          </div>
          <h4 className="font-bold text-[#1B2420]">Mutual Trust Badge</h4>
          <p className="text-[#3A423E]/80 text-[11px] leading-relaxed">
            Clients preferentially hire artisans with verified badges, leading to 3x higher booking rates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkerVerificationView;
