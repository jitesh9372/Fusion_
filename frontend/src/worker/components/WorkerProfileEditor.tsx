import React from 'react';

interface WorkerProfileEditorProps {
  selectedTrade: string;
  setSelectedTrade: (trade: string) => void;
  rateInput: string;
  setRateInput: (rate: string) => void;
  experienceInput: string;
  setExperienceInput: (exp: string) => void;
  serviceAreasInput: string;
  setServiceAreasInput: (areas: string) => void;
  bioInput: string;
  setBioInput: (bio: string) => void;
  onSaveProfile: (e: React.FormEvent) => void;
}

export const WorkerProfileEditor: React.FC<WorkerProfileEditorProps> = ({
  selectedTrade,
  setSelectedTrade,
  rateInput,
  setRateInput,
  experienceInput,
  setExperienceInput,
  serviceAreasInput,
  setServiceAreasInput,
  bioInput,
  setBioInput,
  onSaveProfile,
}) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420]">Worker Public Profile</h1>
        <p className="text-xs text-[#3A423E]/80">
          This information is displayed to customers when searching for verified trade specialists.
        </p>
      </div>

      <form
        onSubmit={onSaveProfile}
        className="p-7 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm space-y-5"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1B2420]">Professional Trade Category</label>
          <select
            value={selectedTrade}
            onChange={e => setSelectedTrade(e.target.value)}
            className="w-full px-4 py-3 text-xs bg-[#EEF1EE] border border-[#D8D3C7] rounded-2xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741] font-semibold"
          >
            <option value="Electricity">⚡ Electricity / Electrical Technician</option>
            <option value="AC Repair">❄️ AC Repair & Refrigeration Specialist</option>
            <option value="Plumbing">🔧 Master Plumber & Piping Specialist</option>
            <option value="Painting">🎨 Architectural Painter & Coating Artisan</option>
            <option value="Carpentry">🪚 Finish Carpenter & Joiner</option>
            <option value="Cleaning">🧹 Commercial & Residential Sanitation Lead</option>
            <option value="Gardening">🌳 Arborist & Landscape Technician</option>
            <option value="Driving">🚗 Professional Chauffeur & Driver</option>
            <option value="Appliance Repair">🏠 Smart Appliance Diagnostic Tech</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1B2420]">Hourly Rate (₹ INR)</label>
            <input
              type="number"
              value={rateInput}
              onChange={e => setRateInput(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-[#EEF1EE] border border-[#D8D3C7] rounded-2xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741] font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1B2420]">Years of Experience</label>
            <input
              type="number"
              value={experienceInput}
              onChange={e => setExperienceInput(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-[#EEF1EE] border border-[#D8D3C7] rounded-2xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741] font-bold"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1B2420]">Service Coverage Areas</label>
          <input
            type="text"
            value={serviceAreasInput}
            onChange={e => setServiceAreasInput(e.target.value)}
            className="w-full px-4 py-3 text-xs bg-[#EEF1EE] border border-[#D8D3C7] rounded-2xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1B2420]">Specialist Bio & Certifications</label>
          <textarea
            rows={4}
            value={bioInput}
            onChange={e => setBioInput(e.target.value)}
            className="w-full px-4 py-3 text-xs bg-[#EEF1EE] border border-[#D8D3C7] rounded-2xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#4A6741] resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs shadow-sm hover:shadow transition-all"
        >
          Save Worker Profile
        </button>
      </form>
    </div>
  );
};

export default WorkerProfileEditor;
