import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Snippet, MergeOption } from '@/types';
import { cn } from '@/utils/cn';

interface DataMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  localSnippets: Snippet[];
  cloudSnippets: Snippet[];
  onMerge: (option: MergeOption) => Promise<void>;
  isSyncing: boolean;
}

export function DataMergeModal({
  isOpen,
  onClose,
  localSnippets,
  cloudSnippets,
  onMerge,
  isSyncing,
}: DataMergeModalProps) {
  const [selectedOption, setSelectedOption] = useState<MergeOption>('merge');

  const handleSubmit = async () => {
    await onMerge(selectedOption);
  };

  const options: { value: MergeOption; label: string; description: string }[] = [
    {
      value: 'upload',
      label: 'ローカルをアップロード',
      description: `このデバイスの ${localSnippets.length} 件のスニペットをクラウドに保存します。クラウドのデータは上書きされます。`,
    },
    {
      value: 'download',
      label: 'クラウドを使用',
      description: `クラウドの ${cloudSnippets.length} 件のスニペットを使用します。このデバイスのデータは破棄されます。`,
    },
    {
      value: 'merge',
      label: '両方をマージ',
      description: `クラウドとローカルのスニペットを統合します（重複を除く）。`,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title="データの同期"
        subtitle="ログイン前のデータとクラウドのデータをどのように扱いますか？"
        onClose={onClose}
      />

      <ModalBody>
        <div className="space-y-4">
          {/* Data comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[var(--color-border)]/30">
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] mb-2">
                このデバイス
              </h4>
              <p className="text-2xl font-black text-[var(--color-text-primary)]">
                {localSnippets.length} 件
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-border)]/30">
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] mb-2">
                クラウド
              </h4>
              <p className="text-2xl font-black text-[var(--color-text-primary)]">
                {cloudSnippets.length} 件
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'block p-4 rounded-xl border-2 cursor-pointer transition-all',
                  selectedOption === option.value
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-border)]/30'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
                )}
              >
                <input
                  type="radio"
                  name="mergeOption"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={() => setSelectedOption(option.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                      selectedOption === option.value
                        ? 'border-[var(--color-text-primary)]'
                        : 'border-[var(--color-border)]'
                    )}
                  >
                    {selectedOption === option.value && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-text-primary)]" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-text-primary)]">
                      {option.label}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSyncing}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSyncing}>
            {isSyncing ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                同期中...
              </>
            ) : (
              '確定'
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
