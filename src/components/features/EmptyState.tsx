import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  onAddClick: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="col-span-full py-24 flex flex-col items-center justify-center animate-pop-in">
      <div className="w-20 h-20 bg-[var(--color-border)]/50 rounded-2xl flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-[var(--color-text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-2">
        リストが空です
      </h3>
      <p className="text-[var(--color-text-secondary)] mb-8 text-center max-w-sm">
        最初の一歩として、新しいスニペットを登録してみましょう
      </p>
      <Button variant="primary" size="lg" onClick={onAddClick}>
        最初のスニペットを登録
      </Button>
    </div>
  );
}
