import { DEFAULT_SPREADSHEET_ID, DEFAULT_SHEET_NAME } from '@jobtracker/shared';

export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

export const SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;

export const SHEET_NAME = process.env.EXPO_PUBLIC_SHEET_NAME || DEFAULT_SHEET_NAME;

export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

export const ANDROID_PACKAGE = 'com.hxndev.jobtracker';
