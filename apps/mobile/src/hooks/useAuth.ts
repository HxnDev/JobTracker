import { useCallback, useEffect, useState } from 'react';
import {
  isSignedIn,
  loadTokens,
  signInAsync,
  signOutAsync,
  subscribe,
} from '@/lib/googleAuth';

export type AuthStatus = 'loading' | 'signed_in' | 'signed_out';

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadTokens().then(() => {
      if (mounted) setStatus(isSignedIn() ? 'signed_in' : 'signed_out');
    });
    const unsubscribe = subscribe(() => {
      if (mounted) setStatus(isSignedIn() ? 'signed_in' : 'signed_out');
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await signInAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutAsync();
  }, []);

  return { status, error, signIn, signOut };
}
