import { useCallback, useEffect, useState } from 'react';
import {
  initAuth,
  isConfigured,
  hasValidToken,
  requestToken,
  signOut as gisSignOut,
} from '@/services/googleAuth';

export function useAuth() {
  const [status, setStatus] = useState('loading'); // loading | signed_out | signed_in | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!isConfigured()) {
      setError('Missing Google Client ID. Set VITE_GOOGLE_CLIENT_ID in your .env file.');
      setStatus('error');
      return;
    }
    initAuth()
      .then(() => {
        if (cancelled) return;
        setStatus(hasValidToken() ? 'signed_in' : 'signed_out');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await requestToken({ prompt: '' });
      setStatus('signed_in');
    } catch (err) {
      setError(err.message || 'Sign-in failed.');
      throw err;
    }
  }, []);

  const signOut = useCallback(() => {
    gisSignOut();
    setStatus('signed_out');
  }, []);

  return { status, error, signIn, signOut };
}
