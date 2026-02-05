import { useState, useEffect } from 'react';
import type { Snippet, SnippetColor } from '@/types';
import { SNIPPET_COLORS } from '@/constants';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/ui/ColorPicker';

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, content: string, color: SnippetColor) => void;
  editingSnippet: Snippet | null;
}

export function SnippetModal({ isOpen, onClose, onSave, editingSnippet }: SnippetModalProps) {
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<SnippetColor>(SNIPPET_COLORS[0]);

  useEffect(() => {
    if (editingSnippet) {
      setLabel(editingSnippet.label);
      setContent(editingSnippet.content);
      setColor(editingSnippet.color);
    } else {
      setLabel('');
      setContent('');
      setColor(SNIPPET_COLORS[0]);
    }
  }, [editingSnippet, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !content.trim()) return;
    onSave(label.trim(), content.trim(), color);
  };

  const isValid = label.trim() && content.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title={editingSnippet ? '項目を編集' : '新しく登録'}
          subtitle="設定パネル"
          onClose={onClose}
        />

        <ModalBody className="space-y-6">
          {/* Label Input */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">
              表示名
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例: メインのアドレス"
              className="input-field text-lg"
              autoFocus
            />
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">
              コピーする内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="コピーしたいテキストを入力してください..."
              className="input-field h-40 resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">
              カラー選択
            </label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isValid}
            className="w-full"
          >
            {editingSnippet ? '変更を保存する' : 'この内容で登録する'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
