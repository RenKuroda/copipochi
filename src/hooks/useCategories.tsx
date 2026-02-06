import { useState, useCallback, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { SnippetColor, CategoryNames } from '@/types';
import { COLOR_LABELS, STORAGE_KEYS } from '@/constants';
import { safeGetItem, safeSetItem } from '@/utils/storage';

interface CategoriesContextValue {
  categoryNames: CategoryNames;
  updateCategoryName: (color: SnippetColor, name: string) => void;
  resetCategoryNames: () => void;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categoryNames, setCategoryNames] = useState<CategoryNames>(() => {
    const saved = safeGetItem<CategoryNames | null>(STORAGE_KEYS.CATEGORY_NAMES, null);
    return saved || { ...COLOR_LABELS };
  });

  // Save to localStorage whenever categoryNames change
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.CATEGORY_NAMES, categoryNames);
  }, [categoryNames]);

  const updateCategoryName = useCallback((color: SnippetColor, name: string) => {
    setCategoryNames((prev) => ({
      ...prev,
      [color]: name || COLOR_LABELS[color],
    }));
  }, []);

  const resetCategoryNames = useCallback(() => {
    setCategoryNames({ ...COLOR_LABELS });
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categoryNames,
        updateCategoryName,
        resetCategoryNames,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
