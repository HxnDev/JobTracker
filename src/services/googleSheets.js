import { SPREADSHEET_ID, SHEET_NAME, DATA_START_ROW, LAST_COLUMN } from '@/config/sheet';
import { getAccessToken, requestToken } from '@/services/googleAuth';
import { mapRowsToJobs, jobToEditableRow, toHyperlinkFormula } from '@/utils/jobs';

const API = 'https://sheets.googleapis.com/v4/spreadsheets';

function range(a1) {
  // Quote the sheet name so spaces/special chars are safe.
  return encodeURIComponent(`'${SHEET_NAME}'!${a1}`);
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

  if (res.status === 401 && allowRetry) {
    // Token may have been revoked; force a fresh one and retry once.
    await requestToken({ prompt: '' });
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

export async function fetchJobs() {
  const dataUrl = `${API}/${SPREADSHEET_ID}/values/${range(
    `A${DATA_START_ROW}:${LAST_COLUMN}`
  )}?valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;

  // Read the URL column with formulas so we can extract the hidden hyperlink.
  const urlUrl = `${API}/${SPREADSHEET_ID}/values/${range(
    `K${DATA_START_ROW}:K`
  )}?valueRenderOption=FORMULA`;

  const [data, urls] = await Promise.all([apiFetch(dataUrl), apiFetch(urlUrl)]);

  return mapRowsToJobs(data.values || [], urls.values || [], DATA_START_ROW);
}

// Finds the first empty data row (1-based) in column A.
async function getNextEmptyRow() {
  const url = `${API}/${SPREADSHEET_ID}/values/${range(
    `A${DATA_START_ROW}:A`
  )}?valueRenderOption=FORMATTED_VALUE`;
  const res = await apiFetch(url);
  const count = (res.values || []).length;
  return DATA_START_ROW + count;
}

// Writes A..I (editable) + K (hyperlink) for a given row. Column J (formula)
// is deliberately left untouched.
async function writeRow(rowNumber, job) {
  const aToI = `${API}/${SPREADSHEET_ID}/values/${range(
    `A${rowNumber}:I${rowNumber}`
  )}?valueInputOption=USER_ENTERED`;

  const kCell = `${API}/${SPREADSHEET_ID}/values/${range(
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

export async function updateJob(job) {
  if (!job.rowNumber) throw new Error('Cannot update a job without a row number.');
  await writeRow(job.rowNumber, job);
  return job;
}

export async function addJob(job) {
  const rowNumber = await getNextEmptyRow();
  await writeRow(rowNumber, job);
  return { ...job, rowNumber };
}
