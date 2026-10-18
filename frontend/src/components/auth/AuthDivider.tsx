import React from 'react';

const AuthDivider: React.FC<{ label?: string }> = ({ label = 'OR' }) => (
  <div className="flex items-center gap-3 my-1" role="separator" aria-label={label}>
    <div className="flex-1 h-px bg-white/10" />
    <span className="text-xs text-white/35 font-medium tracking-widest">{label}</span>
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

export default AuthDivider;
