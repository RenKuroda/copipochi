import { useState } from 'react';
import type { Snippet, SnippetColor } from '@/types';
import { SnippetCard } from './SnippetCard';
import { EmptyState } from './EmptyState';
import { useCategories } from '@/hooks/useCategories';
import { SNIPPET_COLORS } from '@/constants';
import { cn } from '@/utils/cn';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
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
  onChangeColor: (id: string, newColor: SnippetColor) => void;
}

const colorDotClasses: Record<SnippetColor, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-500',
};

// Droppable category section component
function DroppableCategory({
  color,
  children,
  isOver,
}: {
  color: SnippetColor;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: `category-${color}`,
    data: { color },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[100px] rounded-xl p-4 -m-4 transition-all duration-200',
        isOver && 'bg-[var(--color-accent)]/10 ring-2 ring-[var(--color-accent)] ring-dashed'
      )}
    >
      {children}
    </div>
  );
}

export function SnippetGrid({ snippets, isEditMode, onEdit, onDelete, onAddClick, onReorder, onChangeColor }: SnippetGridProps) {
  const { categoryNames, updateCategoryName } = useCategories();
  const [editingCategory, setEditingCategory] = useState<SnippetColor | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCategoryColor, setOverCategoryColor] = useState<SnippetColor | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: { over: { id: string | number; data: { current?: { color?: SnippetColor } } } | null }) => {
    if (!event.over) {
      setOverCategoryColor(null);
      return;
    }

    // Check if hovering over a category drop zone
    const overId = event.over.id as string;
    if (overId.startsWith('category-')) {
      const color = overId.replace('category-', '') as SnippetColor;
      setOverCategoryColor(color);
    } else {
      // Hovering over another snippet - get its color
      const overSnippet = snippets.find((s) => s.id === overId);
      setOverCategoryColor(overSnippet?.color || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverCategoryColor(null);

    if (!over) return;

    const activeSnippet = snippets.find((s) => s.id === active.id);
    if (!activeSnippet) return;

    const overId = over.id as string;

    // Check if dropped on a category
    if (overId.startsWith('category-')) {
      const newColor = overId.replace('category-', '') as SnippetColor;
      if (activeSnippet.color !== newColor) {
        onChangeColor(active.id as string, newColor);
      }
      return;
    }

    // Check if dropped on another snippet
    const overSnippet = snippets.find((s) => s.id === overId);
    if (overSnippet) {
      // If different color, change color
      if (activeSnippet.color !== overSnippet.color) {
        onChangeColor(active.id as string, overSnippet.color);
      } else if (active.id !== over.id) {
        // Same color, reorder within category
        onReorder(active.id as string, over.id as string);
      }
    }
  };

  // Group snippets by color
  const snippetsByColor = SNIPPET_COLORS.reduce((acc, color) => {
    acc[color] = snippets.filter((s) => s.color === color);
    return acc;
  }, {} as Record<SnippetColor, Snippet[]>);

  // Get colors that have snippets (or show all if dragging to allow drop on empty categories)
  const activeColors = activeId
    ? SNIPPET_COLORS
    : SNIPPET_COLORS.filter((color) => snippetsByColor[color].length > 0);

  const handleCategoryNameClick = (color: SnippetColor) => {
    if (isEditMode) {
      setEditingCategory(color);
      setEditValue(categoryNames[color]);
    }
  };

  const handleCategoryNameSave = (color: SnippetColor) => {
    updateCategoryName(color, editValue.trim());
    setEditingCategory(null);
    setEditValue('');
  };

  const handleCategoryNameKeyDown = (e: React.KeyboardEvent, color: SnippetColor) => {
    if (e.key === 'Enter') {
      handleCategoryNameSave(color);
    } else if (e.key === 'Escape') {
      setEditingCategory(null);
      setEditValue('');
    }
  };

  // Get active snippet for drag overlay
  const activeSnippet = activeId ? snippets.find((s) => s.id === activeId) : null;

  if (snippets.length === 0) {
    return <EmptyState onAddClick={onAddClick} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={snippets.map((s) => s.id)}
        strategy={rectSortingStrategy}
      >
        <main className="space-y-8">
          {activeColors.map((color) => (
            <DroppableCategory
              key={color}
              color={color}
              isOver={overCategoryColor === color && activeSnippet?.color !== color}
            >
              <section className="animate-fade-in">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={cn('w-3 h-3 rounded-full', colorDotClasses[color])} />
                  {editingCategory === color ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleCategoryNameSave(color)}
                      onKeyDown={(e) => handleCategoryNameKeyDown(e, color)}
                      className="text-lg font-bold text-[var(--color-text-primary)] bg-transparent 
                                 border-b-2 border-[var(--color-accent)] outline-none px-1"
                      autoFocus
                    />
                  ) : (
                    <h2
                      onClick={() => handleCategoryNameClick(color)}
                      className={cn(
                        'text-lg font-bold text-[var(--color-text-primary)]',
                        isEditMode && 'cursor-pointer hover:text-[var(--color-accent)] transition-colors'
                      )}
                      title={isEditMode ? 'クリックして名前を編集' : undefined}
                    >
                      {categoryNames[color]}
                      {isEditMode && (
                        <span className="ml-2 text-xs text-[var(--color-text-secondary)] font-normal">
                          (クリックで編集)
                        </span>
                      )}
                    </h2>
                  )}
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    ({snippetsByColor[color].length})
                  </span>
                </div>

                {/* Snippets Grid */}
                {snippetsByColor[color].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {snippetsByColor[color].map((snippet) => (
                      <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        isEditMode={isEditMode}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[var(--color-text-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    ここにドロップして追加
                  </div>
                )}
              </section>
            </DroppableCategory>
          ))}
        </main>
      </SortableContext>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeSnippet ? (
          <div className="opacity-80 scale-105 rotate-3">
            <SnippetCard
              snippet={activeSnippet}
              isEditMode={false}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
