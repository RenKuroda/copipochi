import { useState, useCallback } from 'react';
import type { Snippet, SnippetColor } from '@/types';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { SnippetsProvider, useSnippets } from '@/hooks/useSnippets';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SnippetGrid } from '@/components/features/SnippetGrid';
import { SnippetModal } from '@/components/features/SnippetModal';
import { DataMergeModal } from '@/components/features/DataMergeModal';

function AppContent() {
  const {
    snippets,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    needsMerge,
    localSnippetsForMerge,
    cloudSnippetsForMerge,
    handleMerge,
    dismissMerge,
    isSyncing,
  } = useSnippets();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  const handleAddClick = useCallback(() => {
    setEditingSnippet(null);
    setIsModalOpen(true);
  }, []);

  const handleEditClick = useCallback((snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingSnippet(null);
  }, []);

  const handleSave = useCallback(
    (label: string, content: string, color: SnippetColor) => {
      if (editingSnippet) {
        updateSnippet(editingSnippet.id, label, content, color);
      } else {
        addSnippet(label, content, color);
      }
      handleModalClose();
    },
    [editingSnippet, addSnippet, updateSnippet, handleModalClose]
  );

  const handleEditModeToggle = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
      <Header
        onAddClick={handleAddClick}
        isEditMode={isEditMode}
        onEditModeToggle={handleEditModeToggle}
      />

      <SnippetGrid
        snippets={snippets}
        isEditMode={isEditMode}
        onEdit={handleEditClick}
        onDelete={deleteSnippet}
        onAddClick={handleAddClick}
      />

      <SnippetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        editingSnippet={editingSnippet}
      />

      <DataMergeModal
        isOpen={needsMerge}
        onClose={dismissMerge}
        localSnippets={localSnippetsForMerge}
        cloudSnippets={cloudSnippetsForMerge}
        onMerge={handleMerge}
        isSyncing={isSyncing}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SnippetsProvider>
          <AppContent />
        </SnippetsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
