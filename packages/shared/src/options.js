// Dropdown options + the canonical display values. The sheet is messy (e.g.
// "Hybird"), so reads are normalized but these are what we write back.

export const STATUS_OPTIONS = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Ghosted',
];

export const WORK_MODE_OPTIONS = ['On-Site', 'Hybrid', 'Remote'];

export const LANGUAGE_OPTIONS = ['English', 'French', 'German', 'Italian'];

export const JOB_SITE_OPTIONS = [
  'Indeed',
  'LinkedIn',
  'Jobs.ch',
  'Company Site',
  'Other',
];

/** Autocomplete suggestions for the location field (free text still allowed). */
export const LOCATION_SUGGESTIONS = ['Lausanne', 'Geneva'];

// Maps known messy values in the sheet to canonical display values.
export const WORK_MODE_ALIASES = {
  hybird: 'Hybrid',
  hybrid: 'Hybrid',
  'on-site': 'On-Site',
  onsite: 'On-Site',
  'on site': 'On-Site',
  remote: 'Remote',
};

/** @param {string} raw @returns {string} */
export function normalizeWorkMode(raw) {
  if (!raw) return '';
  const key = String(raw).trim().toLowerCase();
  return WORK_MODE_ALIASES[key] || String(raw).trim();
}
