import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'card' | 'stat' | 'row';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  count = 1,
}) => {
  const items = Array.from({ length: count });

  if (variant === 'stat') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-[#D8D3C7]/60 bg-white p-4 space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#EEF1EE]" />
              <div className="w-12 h-4 rounded-md bg-[#EEF1EE]" />
            </div>
            <div className="w-20 h-3 rounded-md bg-[#EEF1EE]" />
            <div className="w-28 h-6 rounded-md bg-[#EEF1EE]" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-[#D8D3C7]/60 bg-white p-6 space-y-4 animate-pulse shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF1EE]" />
              <div className="space-y-2 flex-1">
                <div className="w-3/4 h-4 rounded bg-[#EEF1EE]" />
                <div className="w-1/2 h-3 rounded bg-[#EEF1EE]" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="w-full h-3 rounded bg-[#EEF1EE]" />
              <div className="w-5/6 h-3 rounded bg-[#EEF1EE]" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#EEF1EE]">
              <div className="w-16 h-5 rounded bg-[#EEF1EE]" />
              <div className="w-24 h-8 rounded-xl bg-[#EEF1EE]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className="space-y-3 w-full">
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#D8D3C7]/60 bg-white p-4 flex items-center justify-between animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EEF1EE]" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 rounded bg-[#EEF1EE]" />
                <div className="w-24 h-3 rounded bg-[#EEF1EE]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-6 rounded-full bg-[#EEF1EE]" />
              <div className="w-20 h-8 rounded-xl bg-[#EEF1EE]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-[#EEF1EE] ${
            variant === 'circular'
              ? 'rounded-full'
              : variant === 'text'
              ? 'rounded-md h-4 my-1'
              : 'rounded-2xl'
          } ${className}`}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
