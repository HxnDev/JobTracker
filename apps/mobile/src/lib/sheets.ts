import { createSheetsClient } from '@jobtracker/shared';
import { SPREADSHEET_ID, SHEET_NAME } from './config';
import { getAccessToken, refreshAccessToken } from './googleAuth';

export const sheetsClient = createSheetsClient({
  spreadsheetId: SPREADSHEET_ID,
  sheetName: SHEET_NAME,
  getAccessToken,
  onUnauthorized: refreshAccessToken,
});
