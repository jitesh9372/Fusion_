import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  X,
  UploadCloud,
  FileText,
  Film,
  Image as ImageIcon,
  Trash2,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import type { BookingItem } from '@/types/marketplace';
import { uploadDisputeEvidence } from '@/services/reviewDisputeService';

interface CustomerDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingItem | null;
  reason: string;
  setReason: (reason: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  onSubmit: (evidenceUrls: string[]) => Promise<void> | void;
}

const DISPUTE_REASONS = [
  'Quality of work did not meet agreed cooperative standards',
  'Artisan did not arrive or abandoned scheduled job',
  'Job delivered incomplete or parts missing',
  'Property or appliance damage during service',
  'Unfair additional charges or billing discrepancy',
  'Safety violation or unprofessional conduct',
  'Other contractual or delivery issues',
];

export const CustomerDisputeModal: React.FC<CustomerDisputeModalProps> = ({
  isOpen,
  onClose,
  booking,
  reason,
  setReason,
  description,
  setDescription,
  onSubmit,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ name: string; url: string; isVideo: boolean; size: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !booking) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    addFiles(incoming);
  };

  const addFiles = (incoming: File[]) => {
    setUploadError(null);
    const validFiles: File[] = [];
    const newPreviews: { name: string; url: string; isVideo: boolean; size: number }[] = [];

    // Max 6 files total, max 50MB each
    for (const file of incoming) {
      if (selectedFiles.length + validFiles.length >= 6) {
        setUploadError('Maximum 6 evidence files allowed.');
        break;
      }
      if (file.size > 50 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 50MB size limit.`);
        continue;
      }

      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        setUploadError(`File "${file.name}" is not a supported image or video format.`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push({
        name: file.name,
        url: URL.createObjectURL(file),
        isVideo,
        size: file.size,
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index].url);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 20) {
      setUploadError('Please provide at least 20 characters explaining the dispute.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedUrls = await uploadDisputeEvidence(selectedFiles);
      }
      await onSubmit(uploadedUrls);
      // Clean up preview object URLs
      filePreviews.forEach(p => URL.revokeObjectURL(p.url));
      setSelectedFiles([]);
      setFilePreviews([]);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to submit dispute. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2420]/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-2xl space-y-5 my-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#9C4A34]/15 text-[#9C4A34]">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-[#1B2420]">Raise Cooperative Dispute</h3>
              </div>
              <p className="text-xs text-[#3A423E]">
                Escrow funds are immediately frozen while cooperative arbitrators examine your claim.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#3A423E] hover:text-[#1B2420] hover:bg-[#EEF1EE] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Related Booking Info Card */}
          <div className="p-4 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] text-[#3A423E] uppercase font-bold tracking-wider">
                Disputed Service Order
              </span>
              <h4 className="text-sm font-bold text-[#1B2420] truncate">
                {booking.service_title}
              </h4>
              <div className="text-xs text-[#3A423E] flex flex-wrap gap-2">
                <span>Specialist: <strong className="text-[#1B2420]">{booking.worker_name || 'Assigned Specialist'}</strong></span>
                <span>•</span>
                <span>Order #{booking.id.slice(0, 8)}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-[#3A423E] font-medium block">Frozen Escrow</span>
              <span className="text-base font-extrabold text-[#9C4A34]">
                ₹${Number(booking.total_price || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            {/* Primary Reason */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#1B2420] font-bold">
                Primary Reason for Dispute <span className="text-[#9C4A34]">*</span>
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] focus:border-[#9C4A34] focus:bg-[#FFFFFF] rounded-2xl text-[#1B2420] text-xs font-medium focus:outline-none transition-colors"
              >
                {DISPUTE_REASONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#1B2420] font-bold">
                  Detailed Explanation <span className="text-[#9C4A34]">*</span>
                </label>
                <span className="text-[11px] text-[#3A423E]">
                  {description.length} chars (min 20)
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide a clear, factual breakdown of what occurred. Include dates, times, verbal agreements, or discrepancies observed..."
                className="w-full px-3.5 py-2.5 bg-[#EEF1EE] border border-[#D8D3C7] focus:border-[#9C4A34] focus:bg-[#FFFFFF] rounded-2xl text-[#1B2420] placeholder-[#3A423E]/60 focus:outline-none resize-none transition-colors text-xs leading-relaxed"
              />
            </div>

            {/* Evidence Upload (Images & Videos) */}
            <div className="space-y-2">
              <label className="text-xs text-[#1B2420] font-bold flex items-center justify-between">
                <span>Evidence Files (Images & Videos)</span>
                <span className="text-[11px] font-normal text-[#3A423E]">
                  {selectedFiles.length} of 6 files
                </span>
              </label>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D8D3C7] hover:border-[#9C4A34] bg-[#EEF1EE]/50 hover:bg-[#EEF1EE] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-2.5 rounded-full bg-[#FFFFFF] border border-[#D8D3C7] text-[#9C4A34] shadow-xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1B2420] text-xs">
                    Click to browse or drop images/videos
                  </p>
                  <p className="text-[11px] text-[#3A423E]">
                    Supports JPG, PNG, WEBP, MP4, MOV (Max 50MB per file)
                  </p>
                </div>
              </div>

              {/* Selected Files Previews */}
              {filePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {filePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-[#D8D3C7] bg-[#FFFFFF] p-2 flex flex-col items-center gap-1.5 group"
                    >
                      {preview.isVideo ? (
                        <div className="w-full h-20 rounded-lg bg-[#1B2420] flex flex-col items-center justify-center text-[#FFFFFF] gap-1 relative overflow-hidden">
                          <Film className="w-6 h-6 text-[#D68C31]" />
                          <span className="text-[9px] font-semibold bg-black/60 px-1.5 py-0.5 rounded">Video</span>
                        </div>
                      ) : (
                        <div className="w-full h-20 rounded-lg overflow-hidden bg-[#EEF1EE]">
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-[10px] font-medium text-[#1B2420] truncate w-full text-center">
                        {preview.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-[#9C4A34] text-[#FFFFFF] hover:bg-[#853C28] transition-colors shadow-sm"
                        title="Remove file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-[#9C4A34] font-semibold flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>

            {/* Escrow Lock Banner */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#9C4A34]/10 border border-[#9C4A34]/30 text-[#9C4A34]">
              <Lock className="w-4 h-4 shrink-0" />
              <p className="text-[11px] font-medium leading-relaxed">
                By submitting, the booking escrow amount of <strong>₹${Number(booking.total_price || 0).toFixed(2)}</strong> is locked. Neither party receives payout until resolution is approved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D8D3C7]/60">
              <motion.button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-[#3A423E] hover:text-[#1B2420] font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isUploading || description.trim().length < 20}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-xl bg-[#9C4A34] hover:bg-[#853C28] text-[#FFFFFF] font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading Evidence & Lodging...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lodge Dispute Claim</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerDisputeModal;
