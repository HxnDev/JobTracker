// Google OAuth for the Sheets scope via expo-auth-session (PKCE code flow
// against the Android OAuth client — no client secret). Unlike the web app's
// 1-hour GIS token, installed apps get a refresh token, stored in SecureStore,
// so sign-in survives restarts and refreshes silently.

import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_ANDROID_CLIENT_ID } from './config';

WebBrowser.maybeCompleteAuthSession();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const STORE_KEY = 'jt_google_tokens';

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

let tokens: StoredTokens | null = null;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/** Subscribe to sign-in/sign-out changes. Returns an unsubscribe function. */
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function isConfigured() {
  return Boolean(GOOGLE_ANDROID_CLIENT_ID);
}

async function persist() {
  if (tokens) {
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(tokens));
  } else {
    await SecureStore.deleteItemAsync(STORE_KEY);
  }
}

/** Loads persisted tokens once; safe to call repeatedly. */
export function loadTokens(): Promise<void> {
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORE_KEY);
        if (raw) tokens = JSON.parse(raw) as StoredTokens;
      } catch {
        tokens = null;
      }
    })();
  }
  return loadPromise;
}

export function isSignedIn() {
  return Boolean(tokens && (tokens.refreshToken || tokens.expiresAt > Date.now()));
}

function storeResponse(res: AuthSession.TokenResponse) {
  tokens = {
    accessToken: res.accessToken,
    // Google only returns the refresh token on first consent; keep the old one.
    refreshToken: res.refreshToken ?? tokens?.refreshToken,
    expiresAt: Date.now() + ((res.expiresIn ?? 3600) - 60) * 1000,
  };
}

// Google only allows the *reversed client ID* as a custom redirect scheme for
// Android OAuth clients (package-name schemes get "Error 400: invalid_request").
// "1234-abc.apps.googleusercontent.com" -> "com.googleusercontent.apps.1234-abc".
function reversedClientIdScheme() {
  const prefix = GOOGLE_ANDROID_CLIENT_ID.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${prefix}`;
}

function redirectUri() {
  return AuthSession.makeRedirectUri({
    native: `${reversedClientIdScheme()}:/oauthredirect`,
  });
}

/** Opens the Google consent screen and exchanges the code (PKCE). */
export async function signInAsync(): Promise<void> {
  if (!GOOGLE_ANDROID_CLIENT_ID) {
    throw new Error(
      'Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID — create apps/mobile/.env.'
    );
  }

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: SCOPES,
    redirectUri: redirectUri(),
    usePKCE: true,
  });

  const result = await request.promptAsync(discovery);
  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Sign-in was cancelled.');
  }
  if (result.type !== 'success' || !result.params.code) {
    throw new Error('Google sign-in failed.');
  }

  const response = await AuthSession.exchangeCodeAsync(
    {
      clientId: GOOGLE_ANDROID_CLIENT_ID,
      code: result.params.code,
      redirectUri: redirectUri(),
      extraParams: { code_verifier: request.codeVerifier ?? '' },
    },
    discovery
  );

  storeResponse(response);
  await persist();
  notify();
}

/** Forces a refresh using the stored refresh token. */
export async function refreshAccessToken(): Promise<string> {
  await loadTokens();
  if (!tokens?.refreshToken) {
    await signOutAsync();
    throw new Error('Session expired — please sign in again.');
  }
  try {
    const response = await AuthSession.refreshAsync(
      { clientId: GOOGLE_ANDROID_CLIENT_ID, refreshToken: tokens.refreshToken },
      discovery
    );
    storeResponse(response);
    await persist();
    return tokens!.accessToken;
  } catch (err) {
    // Refresh token revoked/expired: force a clean signed-out state.
    await signOutAsync();
    throw err instanceof Error ? err : new Error('Token refresh failed.');
  }
}

/** Returns a valid bearer token, refreshing silently when expired. */
export async function getAccessToken(): Promise<string> {
  await loadTokens();
  if (!tokens) throw new Error('Not signed in.');
  if (tokens.expiresAt > Date.now()) return tokens.accessToken;
  return refreshAccessToken();
}

export async function signOutAsync(): Promise<void> {
  const token = tokens?.accessToken;
  tokens = null;
  await persist();
  notify();
  if (token) {
    try {
      await AuthSession.revokeAsync({ token }, discovery);
    } catch {
      /* best-effort revoke */
    }
  }
}
