import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  autoComplete?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
};

export const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { label, value, onChange, error, hint, autoComplete = 'current-password', disabled, placeholder, id, className },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  const status = error ? 'error' : 'default';

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={fieldId} className="text-sm font-medium text-ink-800">
          {label}
        </label>
        {hint && !error && (
          <span id={`${fieldId}-hint`} className="text-xs text-ink-500">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-1.5 relative">
        <input
          ref={ref}
          id={fieldId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={describedBy}
          className={[
            'w-full rounded-md border bg-paper-50 py-2.5 pl-3 pr-11 text-[15px] text-ink-900 placeholder:text-ink-400',
            'transition duration-150 focus:outline-none',
            status === 'error' ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-line-strong field-focus',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          tabIndex={0}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded text-ink-500 hover:text-ink-800 hover:bg-paper-200 focus-ring transition"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
        {status === 'error' && (
          <AlertCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 pointer-events-none" aria-hidden />
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-rose-600 animate-fade-in" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
