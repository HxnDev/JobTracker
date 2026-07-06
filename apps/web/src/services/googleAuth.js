// Browser-only Google OAuth via Google Identity Services (GIS), token model.
// No client secret, no refresh token, no backend. The access token lives in
// memory + sessionStorage and is good for ~1 hour.

import { GOOGLE_CLIENT_ID } from '@/config/sheet';

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const STORAGE_KEY = 'jt_token';

let tokenClient = null;
let accessToken = null;
let tokenExpiry = 0;
let pending = null;

function waitForGsi(timeout = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.google?.accounts?.oauth2) return resolve();
      if (Date.now() - start > timeout) {
        return reject(new Error('Google Identity Services failed to load.'));
      }
      setTimeout(tick, 80);
    };
    tick();
  });
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, tokenExpiry }));
  } catch {
    /* ignore storage failures */
  }
}

function restore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.accessToken && parsed.tokenExpiry > Date.now()) {
      accessToken = parsed.accessToken;
      tokenExpiry = parsed.tokenExpiry;
    }
  } catch {
    /* ignore */
  }
}

export function isConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

export async function initAuth() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID.');
  }
  await waitForGsi();
  restore();
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPE,
    callback: (resp) => {
      if (resp.error) {
        pending?.reject(new Error(resp.error_description || resp.error));
        pending = null;
        return;
      }
      accessToken = resp.access_token;
      tokenExpiry = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
      persist();
      pending?.resolve(accessToken);
      pending = null;
    },
  });
}

export function hasValidToken() {
  return Boolean(accessToken) && tokenExpiry > Date.now();
}

// Triggers the Google sign-in / consent popup. Must be called from a user gesture.
export function requestToken({ prompt = '' } = {}) {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('Auth not initialized.'));
    pending = { resolve, reject };
    try {
      tokenClient.requestAccessToken({ prompt });
    } catch (err) {
      pending = null;
      reject(err);
    }
  });
}

// Returns a usable token, refreshing silently if needed.
export async function getAccessToken() {
  if (hasValidToken()) return accessToken;
  return requestToken({ prompt: '' });
}

export function signOut() {
  const token = accessToken;
  accessToken = null;
  tokenExpiry = 0;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {});
  }
}
