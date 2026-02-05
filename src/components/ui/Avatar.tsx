import { cn } from '@/utils/cn';

interface AvatarProps {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  if (!src) {
    // Fallback to initials
    const initials = alt
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          'bg-[var(--color-border)] text-[var(--color-text-secondary)]',
          'font-bold text-sm',
          sizeClasses[size],
          className
        )}
        aria-label={alt}
      >
        {initials || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      referrerPolicy="no-referrer"
    />
  );
}
