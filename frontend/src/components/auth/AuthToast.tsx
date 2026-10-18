import React, { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { toastVariants } from '@/animations/motionConfig';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  autoDismiss?: boolean;
}

interface AuthToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

// ─── Icon + Color Map ─────────────────────────────────────────────────────────
const toastConfig: Record<
  ToastType,
  { Icon: React.FC<{ className?: string }>; colors: string; border: string }
> = {
  success: {
    Icon: CheckCircle,
    colors: 'bg-emerald-500/10 text-emerald-300',
    border: 'border-emerald-500/30',
  },
  error: {
    Icon: XCircle,
    colors: 'bg-red-500/10 text-red-300',
    border: 'border-red-500/30',
  },
  warning: {
    Icon: AlertCircle,
    colors: 'bg-amber-500/10 text-amber-300',
    border: 'border-amber-500/30',
  },
  info: {
    Icon: Info,
    colors: 'bg-indigo-500/10 text-indigo-300',
    border: 'border-indigo-500/30',
  },
};

// ─── Single Toast ─────────────────────────────────────────────────────────────
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const { Icon, colors, border } = toastConfig[toast.type];

  const dismiss = useCallback(() => onDismiss(toast.id), [onDismiss, toast.id]);

  useEffect(() => {
    if (toast.autoDismiss === false) return;
    // Success/info auto-dismiss after 4s; errors persist
    if (toast.type === 'error') return;
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
  }, [toast.type, toast.autoDismiss, dismiss]);

  return (
    <motion.div
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`
        flex items-start gap-3 w-full max-w-[420px] rounded-xl px-4 py-3
        border backdrop-blur-md ${colors} ${border}
      `}
      style={{ background: 'rgba(10,10,15,0.85)' }}
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="flex-shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-white/30 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────
const AuthToast: React.FC<AuthToastProps> = ({ toasts, onDismiss }) => (
  <div
    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full px-4"
    aria-label="Notifications"
  >
    <AnimatePresence mode="sync">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full flex justify-center">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </AnimatePresence>
  </div>
);

export default AuthToast;

// ─── useToast Hook ────────────────────────────────────────────────────────────
import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, autoDismiss?: boolean) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, type, message, autoDismiss }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
};
