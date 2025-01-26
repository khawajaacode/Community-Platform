import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUser(session.user.id);
        }
        setState(prev => ({ ...prev, loading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Failed to initialize auth'),
        }));
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUser(session.user.id);
        } else {
          setState(prev => ({ ...prev, user: null }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUser(userId: string) {
    try {
      const { data, error } = await retryOperation(async () => {
        return await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
      });

      if (error) throw error;

      setState(prev => ({ ...prev, user: data, error: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to fetch user'),
      }));
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error } = await retryOperation(async () => {
        return await supabase.auth.signInWithPassword({
          email,
          password,
        });
      });

      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to sign in'),
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }

  async function signUp(email: string, password: string, userData: Partial<User>) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error: signUpError, data } = await retryOperation(async () => {
        return await supabase.auth.signUp({
          email,
          password,
        });
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await retryOperation(async () => {
          return await supabase
            .from('users')
            .insert([{ id: data.user!.id, email, ...userData }]);
        });

        if (profileError) throw profileError;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to sign up'),
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }

  async function signOut() {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error } = await retryOperation(async () => {
        return await supabase.auth.signOut();
      });

      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to sign out'),
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }

  function clearError() {
    setState(prev => ({ ...prev, error: null }));
  }

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}