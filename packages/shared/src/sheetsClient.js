// Platform-agnostic Google Sheets API v4 client. Auth is injected: the web app
// passes its GIS token getter, the mobile app its expo-auth-session one.

import { DATA_START_ROW, LAST_COLUMN } from './schema.js';
import { mapRowsToJobs, jobToEditableRow, toHyperlinkFormula } from './jobs.js';

const API = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * @param {Object} config
 * @param {string} config.spreadsheetId
 * @param {string} config.sheetName
 * @param {() => Promise<string>} config.getAccessToken Resolves a valid bearer token.
 * @param {() => Promise<string>} [config.onUnauthorized] Called once on a 401;
 *   should force-refresh and resolve a fresh token.
 */
export function createSheetsClient({
  spreadsheetId,
  sheetName,
  getAccessToken,
  onUnauthorized,
}) {
  function range(a1) {
    // Quote the sheet name so spaces/special chars are safe.
    return encodeURIComponent(`'${sheetName}'!${a1}`);
  }

  async function apiFetch(url, options = {}, allowRetry = true) {
    const token = await getAccessToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (res.status === 401 && allowRetry && onUnauthorized) {
      // Token may have been revoked; force a fresh one and retry once.
      await onUnauthorized();
      return apiFetch(url, options, false);
    }

    if (!res.ok) {
      let detail = '';
      try {
        const body = await res.json();
        detail = body?.error?.message || '';
      } catch {
        /* ignore */
      }
      throw new Error(
        `Google Sheets API error (${res.status})${detail ? `: ${detail}` : ''}`
      );
    }

    return res.json();
  }

  async function fetchJobs() {
    const dataUrl = `${API}/${spreadsheetId}/values/${range(
      `A${DATA_START_ROW}:${LAST_COLUMN}`
    )}?valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;

    // Read the URL column with formulas so we can extract the hidden hyperlink.
    const urlUrl = `${API}/${spreadsheetId}/values/${range(
      `K${DATA_START_ROW}:K`
    )}?valueRenderOption=FORMULA`;

    const [data, urls] = await Promise.all([apiFetch(dataUrl), apiFetch(urlUrl)]);

    return mapRowsToJobs(data.values || [], urls.values || [], DATA_START_ROW);
  }

  // Finds the first empty data row (1-based) in column A.
  async function getNextEmptyRow() {
    const url = `${API}/${spreadsheetId}/values/${range(
      `A${DATA_START_ROW}:A`
    )}?valueRenderOption=FORMATTED_VALUE`;
    const res = await apiFetch(url);
    const count = (res.values || []).length;
    return DATA_START_ROW + count;
  }

  // Writes A..I (editable) + K (hyperlink) for a given row. Column J (formula)
  // is deliberately left untouched.
  async function writeRow(rowNumber, job) {
    const aToI = `${API}/${spreadsheetId}/values/${range(
      `A${rowNumber}:I${rowNumber}`
    )}?valueInputOption=USER_ENTERED`;

    const kCell = `${API}/${spreadsheetId}/values/${range(
      `K${rowNumber}`
    )}?valueInputOption=USER_ENTERED`;

    await apiFetch(aToI, {
      method: 'PUT',
      body: JSON.stringify({ values: [jobToEditableRow(job)] }),
    });

    await apiFetch(kCell, {
      method: 'PUT',
      body: JSON.stringify({
        values: [[job.jobUrl ? toHyperlinkFormula(job.jobUrl) : '']],
      }),
    });
  }

  async function updateJob(job) {
    if (!job.rowNumber) throw new Error('Cannot update a job without a row number.');
    await writeRow(job.rowNumber, job);
    return job;
  }

  async function addJob(job) {
    const rowNumber = await getNextEmptyRow();
    await writeRow(rowNumber, job);
    return { ...job, rowNumber };
  }

  // Numeric sheet gid is required by batchUpdate; cache after first lookup.
  let cachedSheetId = null;

  async function getSheetId() {
    if (cachedSheetId != null) return cachedSheetId;
    const url = `${API}/${spreadsheetId}?fields=sheets.properties`;
    const res = await apiFetch(url);
    const match = (res.sheets || []).find(
      (s) => s.properties?.title === sheetName
    );
    if (match?.properties?.sheetId == null) {
      throw new Error(`Sheet "${sheetName}" not found in spreadsheet.`);
    }
    cachedSheetId = match.properties.sheetId;
    return cachedSheetId;
  }

  // Physically removes the row so the sheet stays contiguous (getNextEmptyRow
  // and later rowNumbers stay correct after a refetch).
  async function deleteJob(job) {
    if (!job?.rowNumber) {
      throw new Error('Cannot delete a job without a row number.');
    }
    const sheetId = await getSheetId();
    await apiFetch(`${API}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: job.rowNumber - 1,
                endIndex: job.rowNumber,
              },
            },
          },
        ],
      }),
    });
  }

  return { fetchJobs, addJob, updateJob, deleteJob };
}
