import { useReducer, useEffect, useCallback, createContext, useContext, useState, type ReactNode } from 'react';
import type { Snippet, SnippetAction, SnippetColor, DbSnippet, MergeOption } from '@/types';
import { INITIAL_SNIPPETS, STORAGE_KEYS } from '@/constants';
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

function snippetReducer(state: Snippet[], action: SnippetAction): Snippet[] {
  switch (action.type) {
    case 'SET_SNIPPETS':
      return action.payload;
    case 'ADD_SNIPPET':
      return [action.payload, ...state];
    case 'UPDATE_SNIPPET':
      return state.map((s) =>
        s.id === action.payload.id ? action.payload : s
      );
    case 'DELETE_SNIPPET':
      return state.filter((s) => s.id !== action.payload);
    default:
      return state;
  }
}

function dbSnippetToSnippet(db: DbSnippet): Snippet {
  return {
    id: db.id,
    label: db.label,
    content: db.content,
    color: db.color as SnippetColor,
  };
}

interface SnippetsContextValue {
  snippets: Snippet[];
  addSnippet: (label: string, content: string, color: SnippetColor) => void;
  updateSnippet: (id: string, label: string, content: string, color: SnippetColor) => void;
  deleteSnippet: (id: string) => void;
  importSnippets: (data: Snippet[]) => void;
  exportSnippets: () => void;
  isSyncing: boolean;
  needsMerge: boolean;
  localSnippetsForMerge: Snippet[];
  cloudSnippetsForMerge: Snippet[];
  handleMerge: (option: MergeOption) => Promise<void>;
  dismissMerge: () => void;
}

const SnippetsContext = createContext<SnippetsContextValue | null>(null);

export function SnippetsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [needsMerge, setNeedsMerge] = useState(false);
  const [localSnippetsForMerge, setLocalSnippetsForMerge] = useState<Snippet[]>([]);
  const [cloudSnippetsForMerge, setCloudSnippetsForMerge] = useState<Snippet[]>([]);

  const [snippets, dispatch] = useReducer(snippetReducer, [], () => {
    const saved = safeGetItem<Snippet[]>(STORAGE_KEYS.SNIPPETS, []);
    return saved.length > 0 ? saved : INITIAL_SNIPPETS;
  });

  // Fetch snippets from cloud
  const fetchFromCloud = useCallback(async (): Promise<Snippet[]> => {
    if (!supabase || !user) return [];

    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch from cloud:', error);
      return [];
    }

    return (data as DbSnippet[]).map(dbSnippetToSnippet);
  }, [user]);

  // Sync single snippet to cloud
  const syncToCloud = useCallback(async (snippet: Snippet, action: 'upsert' | 'delete') => {
    if (!supabase || !user) return;

    setIsSyncing(true);
    try {
      if (action === 'delete') {
        await supabase
          .from('snippets')
          .delete()
          .eq('id', snippet.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('snippets')
          .upsert({
            id: snippet.id,
            user_id: user.id,
            label: snippet.label,
            content: snippet.content,
            color: snippet.color,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Check for merge need when user logs in
  useEffect(() => {
    if (authLoading) return;

    const checkMergeNeed = async () => {
      if (!isAuthenticated || !user) {
        // Not authenticated - use localStorage only
        return;
      }

      // Get local snippets (guest data)
      const localData = safeGetItem<Snippet[]>(STORAGE_KEYS.SNIPPETS, []);
      const hasLocalData = localData.length > 0 &&
        !localData.every(s => INITIAL_SNIPPETS.some(init => init.id === s.id));

      // Get cloud snippets
      const cloudData = await fetchFromCloud();
      const hasCloudData = cloudData.length > 0;

      if (hasLocalData && hasCloudData) {
        // Both have data - need merge decision
        setLocalSnippetsForMerge(localData);
        setCloudSnippetsForMerge(cloudData);
        setNeedsMerge(true);
      } else if (hasLocalData && !hasCloudData) {
        // Only local data - auto upload
        setIsSyncing(true);
        for (const snippet of localData) {
          await syncToCloud(snippet, 'upsert');
        }
        setIsSyncing(false);
        // Keep using local data
      } else if (!hasLocalData && hasCloudData) {
        // Only cloud data - load from cloud
        dispatch({ type: 'SET_SNIPPETS', payload: cloudData });
        safeSetItem(STORAGE_KEYS.SNIPPETS, cloudData);
      } else {
        // No data anywhere - use initial snippets and sync
        setIsSyncing(true);
        for (const snippet of INITIAL_SNIPPETS) {
          await syncToCloud(snippet, 'upsert');
        }
        setIsSyncing(false);
      }
    };

    checkMergeNeed();
  }, [isAuthenticated, user, authLoading, fetchFromCloud, syncToCloud]);

  // Handle merge decision
  const handleMerge = useCallback(async (option: MergeOption) => {
    if (!supabase || !user) return;

    setIsSyncing(true);
    try {
      let finalSnippets: Snippet[] = [];

      switch (option) {
        case 'upload':
          // Upload local to cloud, use local
          for (const snippet of localSnippetsForMerge) {
            await syncToCloud(snippet, 'upsert');
          }
          // Delete cloud snippets not in local
          for (const cloudSnippet of cloudSnippetsForMerge) {
            if (!localSnippetsForMerge.some(l => l.id === cloudSnippet.id)) {
              await supabase
                .from('snippets')
                .delete()
                .eq('id', cloudSnippet.id)
                .eq('user_id', user.id);
            }
          }
          finalSnippets = localSnippetsForMerge;
          break;

        case 'download':
          // Use cloud data
          finalSnippets = cloudSnippetsForMerge;
          break;

        case 'merge':
          // Merge both - cloud first, then add unique local items
          const mergedMap = new Map<string, Snippet>();
          for (const snippet of cloudSnippetsForMerge) {
            mergedMap.set(snippet.id, snippet);
          }
          for (const snippet of localSnippetsForMerge) {
            if (!mergedMap.has(snippet.id)) {
              mergedMap.set(snippet.id, snippet);
              await syncToCloud(snippet, 'upsert');
            }
          }
          finalSnippets = Array.from(mergedMap.values());
          break;
      }

      dispatch({ type: 'SET_SNIPPETS', payload: finalSnippets });
      safeSetItem(STORAGE_KEYS.SNIPPETS, finalSnippets);
    } finally {
      setIsSyncing(false);
      setNeedsMerge(false);
      setLocalSnippetsForMerge([]);
      setCloudSnippetsForMerge([]);
    }
  }, [user, localSnippetsForMerge, cloudSnippetsForMerge, syncToCloud]);

  const dismissMerge = useCallback(() => {
    // Use cloud data by default when dismissed
    dispatch({ type: 'SET_SNIPPETS', payload: cloudSnippetsForMerge });
    safeSetItem(STORAGE_KEYS.SNIPPETS, cloudSnippetsForMerge);
    setNeedsMerge(false);
    setLocalSnippetsForMerge([]);
    setCloudSnippetsForMerge([]);
  }, [cloudSnippetsForMerge]);

  // Save to localStorage whenever snippets change
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.SNIPPETS, snippets);
  }, [snippets]);

  const addSnippet = useCallback((label: string, content: string, color: SnippetColor) => {
    const newSnippet: Snippet = {
      id: crypto.randomUUID(),
      label,
      content,
      color,
    };
    dispatch({ type: 'ADD_SNIPPET', payload: newSnippet });

    if (isAuthenticated) {
      syncToCloud(newSnippet, 'upsert');
    }
  }, [isAuthenticated, syncToCloud]);

  const updateSnippet = useCallback((id: string, label: string, content: string, color: SnippetColor) => {
    const updatedSnippet = { id, label, content, color };
    dispatch({ type: 'UPDATE_SNIPPET', payload: updatedSnippet });

    if (isAuthenticated) {
      syncToCloud(updatedSnippet, 'upsert');
    }
  }, [isAuthenticated, syncToCloud]);

  const deleteSnippet = useCallback((id: string) => {
    const snippetToDelete = snippets.find(s => s.id === id);
    dispatch({ type: 'DELETE_SNIPPET', payload: id });

    if (isAuthenticated && snippetToDelete) {
      syncToCloud(snippetToDelete, 'delete');
    }
  }, [snippets, isAuthenticated, syncToCloud]);

  const importSnippets = useCallback(async (data: Snippet[]) => {
    dispatch({ type: 'SET_SNIPPETS', payload: data });

    if (isAuthenticated && supabase && user) {
      setIsSyncing(true);
      try {
        // Delete all existing cloud snippets
        await supabase
          .from('snippets')
          .delete()
          .eq('user_id', user.id);

        // Upload new snippets
        for (const snippet of data) {
          await syncToCloud(snippet, 'upsert');
        }
      } finally {
        setIsSyncing(false);
      }
    }
  }, [isAuthenticated, user, syncToCloud]);

  const exportSnippets = useCallback(() => {
    const dataStr = JSON.stringify(snippets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `copipochi_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [snippets]);

  return (
    <SnippetsContext.Provider
      value={{
        snippets,
        addSnippet,
        updateSnippet,
        deleteSnippet,
        importSnippets,
        exportSnippets,
        isSyncing,
        needsMerge,
        localSnippetsForMerge,
        cloudSnippetsForMerge,
        handleMerge,
        dismissMerge,
      }}
    >
      {children}
    </SnippetsContext.Provider>
  );
}

export function useSnippets(): SnippetsContextValue {
  const context = useContext(SnippetsContext);
  if (!context) {
    throw new Error('useSnippets must be used within a SnippetsProvider');
  }
  return context;
}
