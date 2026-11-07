export function AuthDivider({ children = 'or' }: { children?: React.ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs font-medium uppercase tracking-wider text-ink-400">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
