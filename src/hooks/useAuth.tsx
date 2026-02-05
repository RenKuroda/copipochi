import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, AuthContextValue } from '@/types';

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? null,
    name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? null,
    avatarUrl: supabaseUser.user_metadata?.avatar_url ?? supabaseUser.user_metadata?.picture ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session?.user ?? null));
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(mapSupabaseUser(session?.user ?? null));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      console.warn('Supabase not configured');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { isSupabaseConfigured };
