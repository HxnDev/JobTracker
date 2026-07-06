// Central source of truth describing how the Google Sheet is laid out.
// The "Switzerland" tab has decorative rows above the data:
//   Row 1: title ("Switzerland Job Applications")
//   Row 2: group headers (Record / Job Details / Pipeline / Reference)
//   Row 3: real column headers
//   Row 4+: data
//
// Columns A..K map to the fields below. Column J ("Days Since Applied") is a
// live formula in the sheet, so we NEVER write to it (we compute it ourselves).

export const DEFAULT_SPREADSHEET_ID = '1cnkweKJ-g9ds2kJ5YeXH4Te65Nx5KabcPVJ1mTQFhA4';
export const DEFAULT_SHEET_NAME = 'Switzerland';

export const HEADER_ROW = 3;
export const DATA_START_ROW = 4;

// Highest column letter we touch.
export const LAST_COLUMN = 'K';

/**
 * @typedef {Object} Job
 * @property {number|null} rowNumber 1-based sheet row, null for unsaved jobs
 * @property {string} jobId
 * @property {string|Date} dateApplied
 * @property {string} jobTitle
 * @property {string} company
 * @property {string} location
 * @property {string} language
 * @property {string} workMode
 * @property {string} jobSite
 * @property {string} status
 * @property {string} jobUrl
 * @property {number|null} [daysSinceApplied]
 */

// Ordered column definitions. `index` is the 0-based position in a sheet row array.
export const COLUMNS = [
  { key: 'jobId', label: 'Job ID', col: 'A', index: 0 },
  { key: 'dateApplied', label: 'Date Applied', col: 'B', index: 1 },
  { key: 'jobTitle', label: 'Job Title', col: 'C', index: 2 },
  { key: 'company', label: 'Company', col: 'D', index: 3 },
  { key: 'location', label: 'Location', col: 'E', index: 4 },
  { key: 'language', label: 'Language', col: 'F', index: 5 },
  { key: 'workMode', label: 'Work Mode', col: 'G', index: 6 },
  { key: 'jobSite', label: 'Job Site', col: 'H', index: 7 },
  { key: 'status', label: 'Status', col: 'I', index: 8 },
  { key: 'daysSinceApplied', label: 'Days', col: 'J', index: 9, computed: true },
  { key: 'jobUrl', label: 'Job URL', col: 'K', index: 10, hyperlink: true },
];

export const COLUMN_BY_KEY = Object.fromEntries(COLUMNS.map((c) => [c.key, c]));

// The range that holds editable data (A..I). Column J (formula) and K (hyperlink)
// are handled separately.
export const EDITABLE_RANGE_COLUMNS = { start: 'A', end: 'I' };
