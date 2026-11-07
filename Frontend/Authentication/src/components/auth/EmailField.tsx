import { forwardRef, useId } from 'react';
import { AlertCircle, Check } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  success?: string | null;
  hint?: string;
  autoComplete?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
};

type Status = 'default' | 'error' | 'success';

export const EmailField = forwardRef<HTMLInputElement, Props>(function EmailField(
  { label, value, onChange, error, success, hint, autoComplete = 'email', disabled, placeholder, id, className },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error ? `${fieldId}-error` : success ? `${fieldId}-success` : hint ? `${fieldId}-hint` : undefined;
  const status: Status = error ? 'error' : success ? 'success' : 'default';

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={fieldId} className="text-sm font-medium text-ink-800">
          {label}
        </label>
        {hint && !error && !success && (
          <span id={`${fieldId}-hint`} className="text-xs text-ink-500">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-1.5 relative">
        <input
          ref={ref}
          id={fieldId}
          type="email"
          inputMode="email"
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={describedBy}
          className={[
            'w-full rounded-md border bg-paper-50 px-3 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-400',
            'transition duration-150 focus:outline-none',
            status === 'error' ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' : '',
            status === 'success' ? 'border-sage-400 focus:border-sage-400 focus:ring-2 focus:ring-sage-200' : '',
            status === 'default' ? 'border-line-strong field-focus' : '',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          ].join(' ')}
        />
        {status === 'error' && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 pointer-events-none" aria-hidden />
        )}
        {status === 'success' && (
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-500 pointer-events-none" aria-hidden />
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-rose-600 animate-fade-in" role="alert">
          {error}
        </p>
      )}
      {!error && success && (
        <p id={`${fieldId}-success`} className="mt-1.5 text-xs text-sage-600 animate-fade-in" role="status">
          {success}
        </p>
      )}
    </div>
  );
});

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
  return null;
}
