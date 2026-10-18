import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Plus,
  X,
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Calendar,
  Building,
} from 'lucide-react';
import type { WorkerProfile, WorkerCertificate } from '@/types/marketplace';
import {
  updateWorkerSkills,
  updateWorkerCertificates,
  uploadWorkerDocument,
} from '@/services/marketplaceService';

interface WorkerSkillsViewProps {
  workerProfile: WorkerProfile | null;
  onProfileUpdated: (updated: Partial<WorkerProfile>) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const TRADE_SKILL_SUGGESTIONS: Record<string, string[]> = {
  Electricity: [
    'Emergency Electrical Repair',
    'Wiring & Circuit Installation',
    'Short Circuit Diagnostics',
    'Fuse Box & MCB Upgrades',
    'Inverter & Battery Setup',
    'Appliance Fault Detection',
    'Smart Home Switchgear',
  ],
  'AC Repair': [
    'Split & Window AC Installation',
    'Eco-Gas Refrigerant Refill',
    'Compressor Diagnostics',
    'Cooling Coil Deep Cleaning',
    'PCB Board Troubleshooting',
    'Duct Leakage Sealing',
  ],
  Plumbing: [
    'Pipe Burst & Leak Repair',
    'Bathroom Sanitary Fitting',
    'Water Heater & Geyser Installation',
    'Drainage Blockage Clearing',
    'Motor Pump Diagnostics',
    'Water Tank Float Valve Repair',
  ],
  Carpentry: [
    'Furniture Assembling',
    'Modular Kitchen Repairs',
    'Door Lock & Latch Fitting',
    'Wood Polishing & Restoration',
    'Custom Wardrobe Fabrication',
  ],
  Painting: [
    'Interior Wall Emulsion',
    'Waterproofing & Damp Repair',
    'Exterior Weatherproof Coating',
    'Wood & Metal Enamel Painting',
    'Texture & Stencil Design',
  ],
  Cleaning: [
    'Deep Home Sanitization',
    'Kitchen Degreasing',
    'Sofa & Carpet Shampooing',
    'Bathroom Descaling',
  ],
};

const DEFAULT_SUGGESTIONS = [
  'Equipment Safety Certified',
  'On-Site Fault Diagnostics',
  'Cooperative Quality Standard',
  'Emergency Dispatch Ready',
  'Preventive Maintenance',
];

export const WorkerSkillsView: React.FC<WorkerSkillsViewProps> = ({
  workerProfile,
  onProfileUpdated,
  onToast,
}) => {
  const currentSkills: string[] = workerProfile?.skills || [];
  const currentCertificates: WorkerCertificate[] = workerProfile?.certificates || [];

  const [skillInput, setSkillInput] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);

  const suggestedSkills =
    TRADE_SKILL_SUGGESTIONS[workerProfile?.trade_category || ''] || DEFAULT_SUGGESTIONS;
  const availableSuggestions = suggestedSkills.filter(s => !currentSkills.includes(s));

  // ─── Add Skill ─────────────────────────────────────────────────────────────
  const handleAddSkill = async (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (currentSkills.includes(trimmed)) {
      onToast('info', `"${trimmed}" is already in your skills list.`);
      return;
    }
    if (!workerProfile) {
      onToast('error', 'Worker profile not loaded.');
      return;
    }

    const updatedSkills = [...currentSkills, trimmed];
    setIsAddingSkill(true);
    try {
      const success = await updateWorkerSkills(workerProfile.id, updatedSkills);
      if (success) {
        onProfileUpdated({ skills: updatedSkills });
        setSkillInput('');
        onToast('success', `Added skill "${trimmed}" to your cooperative profile.`);
      } else {
        onToast('error', 'Failed to save skill. Please try again.');
      }
    } finally {
      setIsAddingSkill(false);
    }
  };

  // ─── Remove Skill ──────────────────────────────────────────────────────────
  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!workerProfile) return;
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove);
    const success = await updateWorkerSkills(workerProfile.id, updatedSkills);
    if (success) {
      onProfileUpdated({ skills: updatedSkills });
      onToast('info', `Removed skill "${skillToRemove}".`);
    } else {
      onToast('error', 'Failed to remove skill.');
    }
  };

  // ─── Upload Certificate ───────────────────────────────────────────────────
  const handleSubmitCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerProfile) {
      onToast('error', 'Worker profile not available.');
      return;
    }
    if (!certName.trim() || !certIssuer.trim()) {
      onToast('error', 'Please enter certificate title and issuing organization.');
      return;
    }
    if (!certFile) {
      onToast('error', 'Please select a document or image file.');
      return;
    }

    setIsUploadingCert(true);
    try {
      // Upload file to Supabase Storage
      const fileUrl = await uploadWorkerDocument(workerProfile.id, certFile, 'certificate');
      if (!fileUrl) {
        onToast('error', 'Failed to upload certificate file. Please retry.');
        return;
      }

      const newCert: WorkerCertificate = {
        id: `cert-${Date.now()}`,
        name: certName.trim(),
        issuer: certIssuer.trim(),
        issue_date: certDate || new Date().toISOString().split('T')[0],
        file_url: fileUrl,
      };

      const updatedCerts = [newCert, ...currentCertificates];
      const success = await updateWorkerCertificates(workerProfile.id, updatedCerts);

      if (success) {
        onProfileUpdated({
          certificates: updatedCerts,
          certificate_url: fileUrl,
        });
        setCertModalOpen(false);
        setCertName('');
        setCertIssuer('');
        setCertDate('');
        setCertFile(null);
        onToast('success', `Certificate "${newCert.name}" verified and saved!`);
      } else {
        onToast('error', 'Failed to link certificate to your profile.');
      }
    } catch (err: any) {
      onToast('error', 'Error saving certificate: ' + (err.message || 'Unknown'));
    } finally {
      setIsUploadingCert(false);
    }
  };

  // ─── Delete Certificate ───────────────────────────────────────────────────
  const handleDeleteCertificate = async (certId: string) => {
    if (!workerProfile) return;
    const updatedCerts = currentCertificates.filter(c => c.id !== certId);
    const success = await updateWorkerCertificates(workerProfile.id, updatedCerts);
    if (success) {
      onProfileUpdated({ certificates: updatedCerts });
      onToast('info', 'Certificate removed from your portfolio.');
    } else {
      onToast('error', 'Failed to remove certificate.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420] flex items-center gap-2.5">
            <Award className="w-8 h-8 text-[#4A6741]" />
            Skills & Certifications
          </h1>
          <p className="text-xs text-[#3A423E]/80 mt-1">
            Showcase your verified technical capabilities and vocational credentials to customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCertModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Certificate</span>
        </button>
      </div>

      {/* SECTION 1: TRADE SKILLS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#1B2420] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D68C31]" />
              Trade Specializations & Core Skills
            </h2>
            <p className="text-xs text-[#3A423E]/70 mt-0.5">
              These skill tags are used to match customer dispatches and highlight your profile in searches.
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#EEF1EE] text-[#4A6741] border border-[#D8D3C7]">
            {currentSkills.length} Active Skills
          </span>
        </div>

        {/* Current Active Skills Chips */}
        <div className="flex flex-wrap gap-2.5 min-h-[48px] p-4 rounded-2xl bg-[#EEF1EE]/60 border border-[#D8D3C7]">
          {currentSkills.length === 0 ? (
            <p className="text-xs text-[#3A423E]/60 italic py-1">
              No skills added yet. Add your trade skills below to start receiving matching job requests.
            </p>
          ) : (
            currentSkills.map(skill => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D8D3C7] text-xs font-bold text-[#1B2420] shadow-sm hover:border-[#4A6741] transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6741]" />
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[#3A423E] hover:text-[#9C4A34] hover:bg-[#EEF1EE] transition-colors ml-0.5"
                  title="Remove skill"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))
          )}
        </div>

        {/* Add Skill Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddSkill(skillInput);
          }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <input
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            placeholder="Type a skill (e.g. Copper Pipe Brazing, Inverter Troubleshooting)..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF] transition-all"
          />
          <button
            type="submit"
            disabled={!skillInput.trim() || isAddingSkill}
            className="px-6 py-2.5 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        {availableSuggestions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#D8D3C7]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A423E]/70 block">
              Suggested for {workerProfile?.trade_category || 'Artisans'}:
            </span>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map(suggested => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => handleAddSkill(suggested)}
                  className="text-xs px-3 py-1 rounded-xl bg-[#EEF1EE] hover:bg-[#4A6741]/10 text-[#3A423E] hover:text-[#4A6741] border border-[#D8D3C7] hover:border-[#4A6741]/40 transition-all font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {suggested}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: CERTIFICATES & DIPLOMAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1B2420] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4A6741]" />
              Verified Professional Certificates
            </h2>
            <p className="text-xs text-[#3A423E]/80">
              Government ITI diplomas, skill authority licenses, and authorized manufacturer certificates.
            </p>
          </div>
        </div>

        {currentCertificates.length === 0 ? (
          <div className="p-10 rounded-3xl border border-dashed border-[#D8D3C7] bg-[#FFFFFF] text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center mx-auto text-[#4A6741]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1B2420]">No certificates uploaded yet</h3>
              <p className="text-xs text-[#3A423E]/70 max-w-md mx-auto">
                Uploading verified certificates gives your profile high-ranking priority and boosts client trust by 300%.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCertModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-[#4A6741] text-white font-bold text-xs shadow-sm hover:bg-[#3d5635] transition-all inline-flex items-center gap-1.5 mt-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Your First Certificate</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCertificates.map(cert => (
              <div
                key={cert.id}
                className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#4A6741]/10 border border-[#4A6741]/20 flex items-center justify-center text-[#4A6741] shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1B2420]">{cert.name}</h3>
                        <p className="text-xs text-[#3A423E]/80 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-[#4A6741]" />
                          {cert.issuer}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20 text-[10px] font-extrabold">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  {cert.issue_date && (
                    <p className="text-[11px] text-[#3A423E]/70 flex items-center gap-1 pl-1">
                      <Calendar className="w-3 h-3" />
                      Issued: {cert.issue_date}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#D8D3C7]/60 flex items-center justify-between">
                  <a
                    href={cert.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A6741] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Document</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteCertificate(cert.id)}
                    className="p-1.5 rounded-lg text-[#3A423E] hover:text-[#9C4A34] hover:bg-[#9C4A34]/10 transition-colors"
                    title="Delete certificate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: UPLOAD NEW CERTIFICATE */}
      <AnimatePresence>
        {certModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-2xl space-y-5 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[#D8D3C7] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#1B2420]">Upload Skill Certificate</h3>
                  <p className="text-xs text-[#3A423E]/80">
                    Your certificate will be stored in your cooperative portfolio and verified by FUSION.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCertModalOpen(false)}
                  className="p-1.5 rounded-xl text-[#3A423E] hover:text-[#1B2420] hover:bg-[#EEF1EE] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitCertificate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-bold block">
                    Certificate Title / Name <span className="text-[#9C4A34]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Electrician License, HVAC Tier-2 Certified"
                    value={certName}
                    onChange={e => setCertName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-bold block">
                    Issuing Organization / Authority <span className="text-[#9C4A34]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Skill Development Corp (NSDC), State ITI"
                    value={certIssuer}
                    onChange={e => setCertIssuer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-bold block">Issue Date (Optional)</label>
                  <input
                    type="date"
                    value={certDate}
                    onChange={e => setCertDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] text-xs text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-[#FFFFFF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-bold block">
                    Upload Certificate File (PDF / Image) <span className="text-[#9C4A34]">*</span>
                  </label>
                  <div className="p-4 rounded-2xl border border-dashed border-[#D8D3C7] bg-[#EEF1EE]/50 hover:bg-[#EEF1EE] transition-all text-center">
                    <input
                      type="file"
                      id="cert-file-input"
                      required
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setCertFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="cert-file-input"
                      className="cursor-pointer flex flex-col items-center gap-1.5"
                    >
                      <Upload className="w-6 h-6 text-[#4A6741]" />
                      <span className="text-xs font-bold text-[#1B2420]">
                        {certFile ? certFile.name : 'Click to choose certificate document or image'}
                      </span>
                      <span className="text-[10px] text-[#3A423E]/70">
                        PNG, JPG, or PDF up to 10MB
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCertModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[#3A423E] hover:text-[#1B2420] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingCert}
                    className="px-6 py-2.5 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] disabled:opacity-50 text-white font-bold shadow-sm transition-all"
                  >
                    {isUploadingCert ? 'Uploading & Linking...' : 'Save Certificate'}
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

export default WorkerSkillsView;
