import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import WorkerJobMap from '@/components/map/WorkerJobMap';
import type { BookingItem, BookingStage } from '@/types/marketplace';

interface WorkerAssignedJobsListProps {
  jobs: BookingItem[];
  jobsFilter: 'all' | 'confirmed' | 'in_progress' | 'completed';
  setJobsFilter: (filter: 'all' | 'confirmed' | 'in_progress' | 'completed') => void;
  expandedJobId: string | null;
  setExpandedJobId: (id: string | null | ((prev: string | null) => string | null)) => void;
  onAdvanceStage: (job: BookingItem, stage: BookingStage) => void;
  currentUserId: string;
}

export const WorkerAssignedJobsList: React.FC<WorkerAssignedJobsListProps> = ({
  jobs,
  jobsFilter,
  setJobsFilter,
  expandedJobId,
  setExpandedJobId,
  onAdvanceStage,
  currentUserId,
}) => {
  const filteredJobs = jobs.filter(
    j => jobsFilter === 'all' || j.status === jobsFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420]">My Assigned Jobs</h1>
          <p className="text-xs text-[#3A423E]/80">
            Manage active service executions and advance real-time job stages.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setJobsFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                jobsFilter === tab.id
                  ? 'bg-[#4A6741] text-white shadow-sm'
                  : 'bg-[#FFFFFF] text-[#3A423E] hover:text-[#1B2420] border border-[#D8D3C7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-2 shadow-sm">
            <p className="text-sm font-semibold text-[#1B2420]">No jobs match this filter.</p>
            <p className="text-xs text-[#3A423E]/70">Jobs assigned to you will appear here.</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div
              key={job.id}
              className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Main Job Info Row */}
              <div className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-[#1B2420]">{job.service_title}</h3>
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20">
                      {job.status} • Stage: {job.stage}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-[#3A423E]">
                    <span>Customer: <strong className="text-[#1B2420]">{job.customer_name}</strong></span>
                    <span>📅 {job.scheduled_date} at {job.scheduled_time}</span>
                    <button
                      type="button"
                      onClick={() => setExpandedJobId(prev => (prev === job.id ? null : job.id))}
                      className="flex items-center gap-1 text-[#14524C] font-bold hover:underline transition-colors"
                    >
                      <MapPin className="w-3 h-3 text-[#D68C31]" />
                      {expandedJobId === job.id ? 'Hide Map' : 'View Location'}
                    </button>
                  </div>

                  {job.notes && (
                    <p className="text-xs text-[#3A423E] italic bg-[#EEF1EE] p-2.5 rounded-xl border border-[#D8D3C7]/60">
                      "{job.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAdvanceStage(job, 'dispatched')}
                    className="px-3.5 py-2 rounded-xl bg-[#EEF1EE] text-[#1B2420] border border-[#D8D3C7] text-xs font-bold hover:bg-[#E2E6E2] transition-all"
                  >
                    🚗 En Route
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdvanceStage(job, 'in_progress')}
                    className="px-3.5 py-2 rounded-xl bg-[#D68C31]/15 text-[#9A621C] border border-[#D68C31]/30 text-xs font-bold hover:bg-[#D68C31]/25 transition-all"
                  >
                    ⚡ Start Work
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdvanceStage(job, 'completed')}
                    className="px-4 py-2 rounded-xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs shadow-sm hover:shadow transition-all"
                  >
                    ✓ Complete
                  </button>
                </div>
              </div>

              {/* Expandable Map Section */}
              <AnimatePresence>
                {expandedJobId === job.id && (
                  <motion.div
                    key="job-map"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-[#D8D3C7] bg-[#F4F6F4]"
                  >
                    <div className="p-4">
                      <WorkerJobMap
                        booking={job}
                        workerUserId={currentUserId}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerAssignedJobsList;
