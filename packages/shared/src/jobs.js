import { normalizeStatus, normalizeWorkMode } from './options.js';
import { daysSince, parseSheetDate, toSheetDate } from './dates.js';

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
  workMode: '',
  jobSite: 'LinkedIn',
  status: '',
  jobUrl: '',
  rejectionReason: '',
};

/** @returns {Job} */
export function createEmptyJob() {
  return { ...EMPTY_JOB };
}

// Turns the raw sheet arrays into clean job objects.
// `rows` = values from A{start}:L  ·  `urlRows` = FORMULA values from K{start}:K
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
      status: normalizeStatus(get(8)) || 'Applied',
      jobUrl: extractUrl(urlCell),
      rejectionReason: get(11),
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
    normalizeStatus(job.status) || '',
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

function normalized(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Builds a case-insensitive directory from values already present in the sheet.
 * Existing spelling/capitalisation is preserved and frequently used values rank first.
 * @param {Job[]} jobs
 * @param {'jobTitle'|'company'|'location'} key
 * @param {string[]} [defaults]
 */
export function buildJobSuggestions(jobs, key, defaults = []) {
  const values = new Map();
  for (const value of [...defaults, ...jobs.map((job) => job[key])]) {
    const clean = String(value || '').trim();
    if (!clean) continue;
    const id = normalized(clean);
    const current = values.get(id);
    values.set(id, {
      value: current?.value || clean,
      count: (current?.count || 0) + 1,
    });
  }
  return [...values.values()]
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .map((entry) => entry.value);
}

/**
 * Finds an existing application before a new row is appended. A matching URL is
 * definitive; otherwise title + company must match.
 * @param {Job[]} jobs
 * @param {Job} candidate
 * @returns {Job|null}
 */
export function findDuplicateApplication(jobs, candidate) {
  const url = normalized(candidate.jobUrl).replace(/\/$/, '');
  const title = normalized(candidate.jobTitle);
  const company = normalized(candidate.company);

  return (
    jobs.find((job) => {
      const existingUrl = normalized(job.jobUrl).replace(/\/$/, '');
      if (url && existingUrl && url === existingUrl) return true;
      if (!title || !company) return false;
      if (title !== normalized(job.jobTitle) || company !== normalized(job.company)) {
        return false;
      }
      return true;
    }) || null
  );
}

/** @param {Job['dateApplied']} value */
export function jobMonthKey(value) {
  const date = parseSheetDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Builds the values used by the shared status/month/city/site filters.
 * @param {Job[]} jobs
 */
export function buildJobFilterOptions(jobs) {
  const locations = [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
  const jobSites = [...new Set(jobs.map((job) => job.jobSite).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
  const months = [...new Set(jobs.map((job) => jobMonthKey(job.dateApplied)).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a))
    .map((value) => {
      const [year, month] = value.split('-').map(Number);
      return {
        value,
        label: new Date(year, month - 1, 1).toLocaleDateString('en-CH', {
          month: 'long',
          year: 'numeric',
        }),
      };
    });

  return { locations, jobSites, months };
}

/**
 * Applies the global application filters consistently across lists, KPIs, and charts.
 * @param {Job[]} jobs
 * @param {{query?: string, status?: string, month?: string, location?: string, jobSite?: string, hideRejected?: boolean}} filters
 */
export function filterJobs(jobs, filters = {}) {
  const query = normalized(filters.query);
  return jobs.filter((job) => {
    if (filters.hideRejected && filters.status !== 'Rejected' && job.status === 'Rejected') {
      return false;
    }
    if (filters.status && job.status !== filters.status) return false;
    if (filters.month && jobMonthKey(job.dateApplied) !== filters.month) return false;
    if (filters.location && job.location !== filters.location) return false;
    if (filters.jobSite && job.jobSite !== filters.jobSite) return false;
    if (query) {
      const haystack = normalized(
        `${job.jobTitle} ${job.company} ${job.location} ${job.jobId} ${job.rejectionReason}`
      );
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
