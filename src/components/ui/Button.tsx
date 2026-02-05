import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--color-text-primary)] text-[var(--color-background)]
    hover:opacity-90 active:scale-[0.98]
  `,
  secondary: `
    border-2 border-[var(--color-border)] text-[var(--color-text-primary)]
    hover:border-[var(--color-text-secondary)] active:scale-[0.98]
    bg-transparent
  `,
  ghost: `
    text-[var(--color-text-secondary)]
    hover:bg-[var(--color-border)]/50 active:scale-[0.98]
  `,
  danger: `
    bg-red-500 text-white
    hover:bg-red-600 active:scale-[0.98]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-bold tracking-wide transition-all duration-200 inline-flex items-center justify-center gap-2',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
