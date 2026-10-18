import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EASE_STANDARD, DURATION_BASE } from '@/animations/motionConfig';
import type { PasswordStrength, PasswordStrengthResult } from '@/types/auth';

// ─── Strength Calculation ─────────────────────────────────────────────────────
export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) return { strength: 'none', score: 0, label: '', color: 'transparent', percentage: 0 };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map: Record<number, { strength: PasswordStrength; label: string; color: string; percentage: number }> = {
    0: { strength: 'weak',   label: 'Too weak',  color: '#ef4444', percentage: 10  },
    1: { strength: 'weak',   label: 'Weak',      color: '#f97316', percentage: 25  },
    2: { strength: 'medium', label: 'Fair',      color: '#f59e0b', percentage: 50  },
    3: { strength: 'medium', label: 'Good',      color: '#84cc16', percentage: 70  },
    4: { strength: 'strong', label: 'Strong',    color: '#10b981', percentage: 85  },
    5: { strength: 'strong', label: 'Very strong', color: '#06b6d4', percentage: 100 },
  };

  const capped = Math.min(score, 5) as keyof typeof map;
  return { score: capped, ...map[capped] };
};

// ─── Component ────────────────────────────────────────────────────────────────
interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const result = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1" aria-label={`Password strength: ${result.label}`}>
      {/* Bar track */}
      <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: result.color }}
          initial={{ width: 0 }}
          animate={{ width: `${result.percentage}%` }}
          transition={{ duration: DURATION_BASE, ease: EASE_STANDARD }}
        />
      </div>

      {/* Label */}
      <motion.p
        className="text-[10px] font-medium"
        style={{ color: result.color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION_BASE }}
      >
        {result.label}
      </motion.p>
    </div>
  );
};

export default PasswordStrengthMeter;
