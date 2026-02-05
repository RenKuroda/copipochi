import type { Snippet } from '@/types';
import { SnippetCard } from './SnippetCard';
import { EmptyState } from './EmptyState';

interface SnippetGridProps {
  snippets: Snippet[];
  isEditMode: boolean;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

export function SnippetGrid({ snippets, isEditMode, onEdit, onDelete, onAddClick }: SnippetGridProps) {
  if (snippets.length === 0) {
    return <EmptyState onAddClick={onAddClick} />;
  }

  return (
    <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          isEditMode={isEditMode}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </main>
  );
}
