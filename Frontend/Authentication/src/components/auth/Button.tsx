import { Loader2 } from 'lucide-react';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin-slow ${className ?? ''}`} aria-hidden />;
}

type ButtonProps = {
  loading?: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'google';
  className?: string;
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition duration-150 focus-ring disabled:opacity-70 disabled:cursor-not-allowed select-none';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-ink-900 text-paper-50 hover:bg-ink-800 active:bg-ink-900 px-4 py-2.5 text-[15px] shadow-soft',
  secondary: 'bg-paper-50 text-ink-800 border border-line-strong hover:bg-paper-100 px-4 py-2.5 text-[15px]',
  google: 'bg-paper-50 text-ink-800 border border-line-strong hover:bg-paper-100 px-4 py-2.5 text-[15px] w-full',
};

export function Button({
  loading = false,
  loadingLabel,
  children,
  variant = 'primary',
  className,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className ?? ''}`} disabled={loading || rest.disabled} {...rest}>
      {loading && <Spinner className="h-4 w-4" />}
      {loading && loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
      {children}
    </button>
  );
}
