export type SnippetColor = 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'gray';

export type CategoryNames = Record<SnippetColor, string>;

export interface Snippet {
  id: string;
  label: string;
  content: string;
  color: SnippetColor;
}

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export type SnippetAction =
  | { type: 'SET_SNIPPETS'; payload: Snippet[] }
  | { type: 'ADD_SNIPPET'; payload: Snippet }
  | { type: 'UPDATE_SNIPPET'; payload: Snippet }
  | { type: 'DELETE_SNIPPET'; payload: string }
  | { type: 'REORDER_SNIPPETS'; payload: { activeId: string; overId: string } };

// Auth types
export interface User {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Database types (Supabase)
export interface DbSnippet {
  id: string;
  user_id: string;
  label: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// Merge options
export type MergeOption = 'upload' | 'download' | 'merge';
