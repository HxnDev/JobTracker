import { normalizeWorkMode } from './options.js';
import { daysSince, toSheetDate } from './dates.js';

/** @typedef {import('./schema.js').Job} Job */

// Pulls the URL out of a cell. Handles:
//   =HYPERLINK("https://...","Open Job")   (en-US comma separator)
//   =HYPERLINK("https://...";"Open Job")   (CH/EU semicolon separator)
//   https://... (plain text)
export function extractUrl(formulaOrText) {
  if (!formulaOrText) return '';
  const str = String(formulaOrText).trim();
  const m = str.match(/HYPERLINK\(\s*"([^"]*)"/i);
  if (m) return m[1];
  if (/^https?:\/\//i.test(str)) return str;
  return '';
}

// Builds the formula we write back so the sheet keeps showing "Open Job".
export function toHyperlinkFormula(url) {
  if (!url) return '';
  const safe = String(url).replace(/"/g, '%22');
  return `=HYPERLINK("${safe}","Open Job")`;
}

const EMPTY_JOB = {
  rowNumber: null,
  jobId: '',
  dateApplied: '',
  jobTitle: '',
  company: '',
  location: '',
  language: 'English',
  workMode: 'Hybrid',
  jobSite: 'LinkedIn',
  status: '',
  jobUrl: '',
};

/** @returns {Job} */
export function createEmptyJob() {
  return { ...EMPTY_JOB };
}

// Turns the raw sheet arrays into clean job objects.
// `rows` = values from A{start}:K  ·  `urlRows` = FORMULA values from K{start}:K
/** @returns {Job[]} */
export function mapRowsToJobs(rows, urlRows, startRow) {
  const jobs = [];
  rows.forEach((row, i) => {
    const get = (idx) => (row[idx] ?? '').toString().trim();
    const jobId = get(0);
    const jobTitle = get(2);
    const company = get(3);

    // Skip phantom/template rows.
    if (!jobId && !jobTitle && !company) return;

    const dateApplied = get(1);
    const urlCell = urlRows?.[i]?.[0] ?? row[10] ?? '';

    jobs.push({
      rowNumber: startRow + i,
      jobId,
      dateApplied,
      jobTitle,
      company,
      location: get(4),
      language: get(5),
      workMode: normalizeWorkMode(get(6)),
      jobSite: get(7),
      status: get(8) || 'Applied',
      jobUrl: extractUrl(urlCell),
      daysSinceApplied: daysSince(dateApplied),
    });
  });
  return jobs;
}

// The A..I values array we PUT back to the sheet (J formula + K hyperlink are
// written separately).
/** @param {Job} job */
export function jobToEditableRow(job) {
  return [
    job.jobId || '',
    toSheetDate(job.dateApplied) || job.dateApplied || '',
    job.jobTitle || '',
    job.company || '',
    job.location || '',
    job.language || '',
    normalizeWorkMode(job.workMode) || '',
    job.jobSite || '',
    job.status || '',
  ];
}

// Generates the next sequential CH-### id.
/** @param {Job[]} jobs */
export function getNextJobId(jobs) {
  let max = 0;
  for (const job of jobs) {
    const m = String(job.jobId || '').match(/(\d+)\s*$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  const next = max + 1;
  return `CH-${String(next).padStart(3, '0')}`;
}
