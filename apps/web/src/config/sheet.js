// Web-specific configuration: env vars + defaults. The sheet layout itself
// (rows, columns, ranges) lives in @jobtracker/shared.

import { DEFAULT_SPREADSHEET_ID, DEFAULT_SHEET_NAME } from '@jobtracker/shared';

export const SPREADSHEET_ID =
  import.meta.env.VITE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;

export const SHEET_NAME = import.meta.env.VITE_SHEET_NAME || DEFAULT_SHEET_NAME;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
