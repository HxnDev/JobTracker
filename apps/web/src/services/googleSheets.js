// Thin web wrapper around the shared Sheets client, wired to GIS auth.

import { createSheetsClient } from '@jobtracker/shared';
import { SPREADSHEET_ID, SHEET_NAME } from '@/config/sheet';
import { getAccessToken, requestToken } from '@/services/googleAuth';

const client = createSheetsClient({
  spreadsheetId: SPREADSHEET_ID,
  sheetName: SHEET_NAME,
  getAccessToken,
  onUnauthorized: () => requestToken({ prompt: '' }),
});

export const { fetchJobs, addJob, updateJob, deleteJob } = client;
