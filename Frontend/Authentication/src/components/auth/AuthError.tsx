type Props = {
  message: string;
  onDismiss?: () => void;
};

export function AuthError({ message, onDismiss }: Props) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50/70 px-3.5 py-3 text-sm text-rose-700 animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <span className="flex-1 leading-relaxed">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="text-rose-500 hover:text-rose-700 transition focus-ring rounded"
        >
          ✕
        </button>
      )}
    </div>
  );
}
