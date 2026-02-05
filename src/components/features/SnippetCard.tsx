import type { Snippet } from '@/types';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/utils/cn';

interface SnippetCardProps {
  snippet: Snippet;
  isEditMode: boolean;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

const colorClasses: Record<string, { card: string; dot: string }> = {
  blue: {
    card: 'snippet-blue',
    dot: 'bg-blue-500',
  },
  purple: {
    card: 'snippet-purple',
    dot: 'bg-purple-500',
  },
  pink: {
    card: 'snippet-pink',
    dot: 'bg-pink-500',
  },
  green: {
    card: 'snippet-green',
    dot: 'bg-emerald-500',
  },
  orange: {
    card: 'snippet-orange',
    dot: 'bg-orange-500',
  },
  gray: {
    card: 'snippet-gray',
    dot: 'bg-gray-500',
  },
};

export function SnippetCard({ snippet, isEditMode, onEdit, onDelete }: SnippetCardProps) {
  const { isCopied, copy } = useClipboard();
  const colors = colorClasses[snippet.color] || colorClasses.gray;

  const handleClick = async () => {
    if (isEditMode) {
      onEdit(snippet);
    } else {
      await copy(snippet.content);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('この項目を削除しますか？')) {
      onDelete(snippet.id);
    }
  };

  return (
    <div className="relative group animate-pop-in">
      {/* Delete button */}
      {isEditMode && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 z-10 w-7 h-7
                     bg-red-500 text-white rounded-full
                     flex items-center justify-center
                     shadow-lg hover:bg-red-600 hover:scale-110
                     active:scale-95 transition-all duration-200"
          aria-label="削除"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Label */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
        <span className="text-sm font-bold text-[var(--color-text-primary)] truncate">
          {snippet.label || '無題'}
        </span>
      </div>

      {/* Card */}
      <button
        onClick={handleClick}
        className={cn(
          'w-full py-6 px-5 rounded-2xl border-2 transition-all duration-200',
          'text-left overflow-hidden',
          isEditMode
            ? 'border-dashed border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
            : cn(colors.card, 'hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]')
        )}
      >
        {isEditMode ? (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <svg className="w-6 h-6 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              編集する
            </span>
          </div>
        ) : isCopied ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-bold tracking-wide">コピー完了</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-medium">
              {snippet.content}
            </span>
            <svg
              className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}
