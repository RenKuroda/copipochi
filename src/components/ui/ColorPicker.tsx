import type { SnippetColor } from '@/types';
import { SNIPPET_COLORS, COLOR_LABELS } from '@/constants';
import { cn } from '@/utils/cn';

interface ColorPickerProps {
  value: SnippetColor;
  onChange: (color: SnippetColor) => void;
}

const colorStyles: Record<SnippetColor, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-500',
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {SNIPPET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'w-10 h-10 rounded-xl transition-all duration-200',
            colorStyles[color],
            value === color
              ? 'ring-2 ring-offset-2 ring-[var(--color-text-primary)] ring-offset-[var(--color-surface)] scale-110'
              : 'opacity-60 hover:opacity-100 hover:scale-105'
          )}
          title={COLOR_LABELS[color]}
          aria-label={COLOR_LABELS[color]}
          aria-pressed={value === color}
        />
      ))}
    </div>
  );
}
