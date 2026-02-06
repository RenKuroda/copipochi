import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthButton } from '@/components/features/AuthButton';

interface HeaderProps {
  onAddClick: () => void;
  isEditMode: boolean;
  onEditModeToggle: () => void;
}

export function Header({ onAddClick, isEditMode, onEditModeToggle }: HeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[var(--color-text-primary)] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-[var(--color-background)] text-2xl">*</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--color-text-primary)] uppercase font-heading">
          Copipochi
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button variant="primary" size="lg" onClick={onAddClick}>
          新規登録
        </Button>

        <Button
          variant={isEditMode ? 'danger' : 'secondary'}
          size="lg"
          onClick={onEditModeToggle}
        >
          {isEditMode ? '編集を終了' : 'リストを編集'}
        </Button>

        <AuthButton />
      </div>
    </header>
  );
}
