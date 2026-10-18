import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, XCircle, Layers } from 'lucide-react';
import type { ServiceItem } from '@/types/marketplace';

interface AdminServicesManagementProps {
  services: ServiceItem[];
  newServiceModalOpen: boolean;
  setNewServiceModalOpen: (open: boolean) => void;
  serviceTitle: string;
  setServiceTitle: (title: string) => void;
  serviceCategory: string;
  setServiceCategory: (cat: string) => void;
  servicePrice: string;
  setServicePrice: (price: string) => void;
  serviceDesc: string;
  setServiceDesc: (desc: string) => void;
  onCreateService: (e: React.FormEvent) => void;
  onToggleService: (serviceId: string, currentActive: boolean) => void;
}

export const AdminServicesManagement: React.FC<AdminServicesManagementProps> = ({
  services,
  newServiceModalOpen,
  setNewServiceModalOpen,
  serviceTitle,
  setServiceTitle,
  serviceCategory,
  setServiceCategory,
  servicePrice,
  setServicePrice,
  serviceDesc,
  setServiceDesc,
  onCreateService,
  onToggleService,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">Marketplace Services Catalog</h2>
          <p className="text-xs text-[#3A423E]/80">
            Add new trade service offerings and manage platform-wide category availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewServiceModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#9C4A34] hover:bg-[#853d29] text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-2 shadow-sm">
            <Layers className="w-10 h-10 text-[#3A423E]/30 mx-auto" />
            <p className="text-sm font-semibold text-[#1B2420]">No marketplace services cataloged yet.</p>
          </div>
        ) : (
          services.map(srv => (
            <div
              key={srv.id}
              className="p-6 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#14524C]/10 text-[#14524C] border border-[#14524C]/20">
                    {srv.category}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      srv.active
                        ? 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20'
                        : 'bg-[#EEF1EE] text-[#3A423E]/60 border border-[#D8D3C7]'
                    }`}
                  >
                    {srv.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1B2420]">{srv.title}</h3>
                <p className="text-xs text-[#3A423E]/80 line-clamp-2">{srv.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#D8D3C7]/60">
                <span className="text-sm font-extrabold text-[#1B2420]">
                  ₹{srv.base_price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleService(srv.id, srv.active)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    srv.active
                      ? 'bg-[#EEF1EE] hover:bg-red-50 text-[#3A423E] hover:text-red-600 border border-[#D8D3C7]'
                      : 'bg-[#4A6741]/15 hover:bg-[#4A6741]/25 text-[#4A6741] border border-[#4A6741]/30'
                  }`}
                >
                  {srv.active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Service Modal */}
      <AnimatePresence>
        {newServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#FFFFFF] border border-[#D8D3C7] shadow-2xl space-y-5"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1B2420]">Add Marketplace Service</h3>
                <p className="text-xs text-[#3A423E]/80">
                  Define the trade title, category, and standard starting rate.
                </p>
              </div>

              <form onSubmit={onCreateService} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-semibold">Service Title</label>
                  <input
                    type="text"
                    required
                    value={serviceTitle}
                    onChange={e => setServiceTitle(e.target.value)}
                    placeholder="e.g. Electrical Safety Inspection"
                    className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#9C4A34]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[#1B2420] font-semibold">Category</label>
                    <select
                      value={serviceCategory}
                      onChange={e => setServiceCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#9C4A34]"
                    >
                      <option value="Electricity">Electricity</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Painting">Painting</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Gardening">Gardening</option>
                      <option value="Driving">Driving</option>
                      <option value="Appliance Repair">Appliance Repair</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#1B2420] font-semibold">Base Price (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={servicePrice}
                      onChange={e => setServicePrice(e.target.value)}
                      className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#9C4A34] font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#1B2420] font-semibold">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={serviceDesc}
                    onChange={e => setServiceDesc(e.target.value)}
                    placeholder="Provide scope of work and standard equipment included..."
                    className="w-full px-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-[#1B2420] focus:outline-none focus:ring-1 focus:ring-[#9C4A34] resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setNewServiceModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[#3A423E] hover:text-[#1B2420] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#9C4A34] hover:bg-[#853d29] text-white font-bold shadow-sm transition-all"
                  >
                    Create Service
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

export default AdminServicesManagement;
