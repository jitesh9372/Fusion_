import React from 'react';

interface WorkerAvailabilityScheduleProps {
  onSaveSchedule: () => void;
}

export const WorkerAvailabilitySchedule: React.FC<WorkerAvailabilityScheduleProps> = ({
  onSaveSchedule,
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420]">Availability & Working Hours</h1>
        <p className="text-xs text-[#3A423E]/80">
          Set your weekly appointment slots and automated dispatch availability.
        </p>
      </div>

      <div className="p-7 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm space-y-5">
        <div className="space-y-2">
          {days.map(day => (
            <div
              key={day}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7]/60 text-xs"
            >
              <span className="font-bold text-[#1B2420]">{day}</span>
              <span className="text-[#4A6741] font-mono font-bold">08:00 AM – 06:00 PM</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20 font-semibold">
                Active Slot
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onSaveSchedule}
          className="px-6 py-2.5 rounded-xl bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold text-xs shadow-sm hover:shadow transition-all"
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
};

export default WorkerAvailabilitySchedule;
