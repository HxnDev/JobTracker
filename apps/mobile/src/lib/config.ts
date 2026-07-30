import { DEFAULT_SPREADSHEET_ID, DEFAULT_SHEET_NAME } from '@jobtracker/shared';

// Android OAuth client IDs are public (no secret issued; bound to package + SHA-1).
// Fallback matches eas.json so an OTA publish that forgets the env var cannot
// wipe sign-in — which is what broke the preview app.
const DEFAULT_GOOGLE_ANDROID_CLIENT_ID =
  '772121882720-nhtnqglb5t342g9la62k5vpve41jcbv4.apps.googleusercontent.com';

export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || DEFAULT_GOOGLE_ANDROID_CLIENT_ID;

export const SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;

export const SHEET_NAME = process.env.EXPO_PUBLIC_SHEET_NAME || DEFAULT_SHEET_NAME;

export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

export const ANDROID_PACKAGE = 'com.hxndev.jobtracker';
