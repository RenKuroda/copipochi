export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border)] pt-12 pb-16 flex flex-col sm:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold tracking-[0.3em] text-[var(--color-text-secondary)] uppercase">
          Copipochi
        </span>
      </div>
      <div className="flex gap-8">
        <span className="text-[11px] font-medium tracking-wider text-[var(--color-text-secondary)]/60">
          Instant Snippet Manager
        </span>
        <span className="text-[11px] font-medium tracking-wider text-[var(--color-text-secondary)]/60">
          EST. 2024
        </span>
      </div>
    </footer>
  );
}
