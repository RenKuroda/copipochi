import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthButton } from '@/components/features/AuthButton';
import { useSnippets } from '@/hooks/useSnippets';
import type { Snippet } from '@/types';

interface HeaderProps {
  onAddClick: () => void;
  isEditMode: boolean;
  onEditModeToggle: () => void;
}

export function Header({ onAddClick, isEditMode, onEditModeToggle }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportSnippets, importSnippets } = useSnippets();

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          if (window.confirm('現在のリストを上書きしてバックアップから復元しますか？')) {
            importSnippets(json as Snippet[]);
          }
        } else {
          alert('正しい形式のバックアップファイルではありません。');
        }
      } catch {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
      {/* Logo & Title */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--color-text-primary)] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-[var(--color-background)] text-2xl">*</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--color-text-primary)] uppercase font-heading">
            Copipochi
          </h1>
        </div>

        {/* Backup/Restore */}
        <div className="flex items-center gap-2 sm:ml-4">
          <button
            onClick={exportSnippets}
            className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)]
                       border border-[var(--color-border)] rounded-full
                       hover:bg-[var(--color-border)]/50 transition-all uppercase"
          >
            Backup
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)]
                       border border-[var(--color-border)] rounded-full
                       hover:bg-[var(--color-border)]/50 transition-all uppercase"
          >
            Restore
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
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
