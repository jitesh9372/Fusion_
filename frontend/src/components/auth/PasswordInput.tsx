import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { errorMessageVariants, shakeKeyframes, EASE_STANDARD, DURATION_BASE } from '@/animations/motionConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PasswordInputProps {
  id?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
  registration?: Record<string, unknown>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      label = 'Password',
      value,
      defaultValue,
      error,
      disabled,
      autoComplete = 'current-password',
      placeholder = ' ',
      className = '',
      registration,
      onChange,
      onBlur,
      ...rest
    },
    forwardedRef
  ) => {
    const reducedMotion = useReducedMotion();
    const autoId = useId();
    const inputId = id ?? (registration as any)?.name ?? autoId;
    const inputName = (registration as any)?.name ?? (id || 'password');
    const errorId = `${inputId}-error`;
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(value || defaultValue)
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      onChange?.(e);
      (registration as any)?.onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(e.target.value.length > 0);
      onBlur?.(e);
      (registration as any)?.onBlur?.(e);
    };

    // Combine forwarded ref and react-hook-form registration ref
    const setRefs = (node: HTMLInputElement | null) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }

      if (typeof (registration as any)?.ref === 'function') {
        (registration as any).ref(node);
      }
    };

    return (
      <div className={`w-full ${className}`}>
        {/* Input wrapper */}
        <motion.div
          className="relative"
          animate={error && !reducedMotion ? shakeKeyframes : {}}
        >
          {/* Input rendered first for CSS peer selectors */}
          <input
            {...registration}
            ref={setRefs}
            id={inputId}
            name={inputName}
            type={showPassword ? 'text' : 'password'}
            placeholder=" "
            disabled={disabled}
            autoComplete={autoComplete}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            className={`
              peer w-full pt-5 pb-2 pl-3.5 pr-11
              bg-white/[0.04] rounded-xl text-sm text-white
              border transition-shadow transition-colors duration-200
              focus:outline-none placeholder-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500/60 focus:border-red-400 focus:ring-1 focus:ring-red-500/30'
                : 'border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25'
              }
            `}
            style={{
              background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
            }}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            {...rest}
          />

          {/* Floating label using peer state */}
          <label
            htmlFor={inputId}
            className={`
              absolute left-3.5 pointer-events-none select-none font-medium z-10 transition-all duration-200
              top-2 text-[10px] text-indigo-400
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-white/40
              peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-indigo-400
            `}
          >
            {label}
          </label>

          {/* Show/hide toggle */}
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-white/30 transition-opacity"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            <AnimatePresence mode="wait" initial={false}>
              {showPassword ? (
                <motion.span
                  key="eye-off"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <EyeOff className="w-4 h-4 text-white/60" />
                </motion.span>
              ) : (
                <motion.span
                  key="eye"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Eye className="w-4 h-4 text-white/60" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              id={errorId}
              role="alert"
              aria-live="polite"
              className="mt-1.5 text-xs text-red-400 px-1"
              variants={errorMessageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
