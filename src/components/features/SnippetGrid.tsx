import type { Snippet } from '@/types';
import { SnippetCard } from './SnippetCard';
import { EmptyState } from './EmptyState';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface SnippetGridProps {
  snippets: Snippet[];
  isEditMode: boolean;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function SnippetGrid({ snippets, isEditMode, onEdit, onDelete, onAddClick, onReorder }: SnippetGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  if (snippets.length === 0) {
    return <EmptyState onAddClick={onAddClick} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={snippets.map((s) => s.id)}
        strategy={rectSortingStrategy}
      >
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
      </SortableContext>
    </DndContext>
  );
}
