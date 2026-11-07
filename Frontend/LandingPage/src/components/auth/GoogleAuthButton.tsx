import { Spinner } from './Button';
import { GoogleLogo } from './GoogleLogo';

type Props = {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  label?: string;
};

export function GoogleAuthButton({
  onClick,
  loading = false,
  disabled = false,
  loadingLabel = 'Signing in with Google…',
  label = 'Continue with Google',
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full inline-flex items-center justify-center gap-2.5 rounded-md border border-line-strong bg-paper-50 px-4 py-2.5 text-[15px] font-medium text-ink-800 transition duration-150 hover:bg-paper-100 focus-ring disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? <Spinner className="h-4 w-4 text-ink-500" /> : <GoogleLogo className="h-4 w-4" />}
      <span>{loading ? loadingLabel : label}</span>
    </button>
  );
}
