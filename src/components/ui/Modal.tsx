import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          'bg-[var(--color-surface)] rounded-3xl shadow-2xl',
          'border border-[var(--color-border)]',
          'animate-slide-up',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div className="flex justify-between items-start p-8 pb-0">
      <div>
        <h2 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[var(--color-text-secondary)] text-sm font-medium mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-xl
                   bg-[var(--color-border)]/50 text-[var(--color-text-secondary)]
                   hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]
                   transition-all duration-200"
        aria-label="閉じる"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('p-8', className)}>
      {children}
    </div>
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('p-8 pt-0', className)}>
      {children}
    </div>
  );
}
